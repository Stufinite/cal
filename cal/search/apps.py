# -*- coding: utf-8 -*-
from django.apps import AppConfig
from pymongo import MongoClient
import re, urllib, requests, json, jieba, jieba.analyse
from timetable.models import Course
from bs4 import BeautifulSoup
from django.shortcuts import get_list_or_404

class SearchConfig(AppConfig):
    name = 'search'
    
class SearchOb(object):
	"""docstring for SearchOb"""
	def __init__(self, keyword="", school=None, uri=None):
		self.client = MongoClient(uri)
		self.db = self.client['timetable']
		self.SrchCollect = self.db['CourseSearch']
		self.keyword = keyword.split()
		self.school = school
		self.result = tuple()

	def getResult(self):
		self.doSearch()
		return self.result

	def doSearch(self):
		if len(self.keyword) == 1:
			self.keyword = self.keyword[0]
			self.result = self.KEMSearch(self.keyword)
		else:
			self.result = self.TCsearch()

	def KEMSearch(self, kw):
		cursor = self.SrchCollect.find({kw: {"$exists": True}}).limit(1)
		if cursor.count() > 0:
			# Key Exist
			return sorted(list(cursor)[0][kw][self.school], key=lambda x:x['CourseCode'])
		else:
			try:
				text = requests.get('http://api.udic.cs.nchu.edu.tw/api/kemApi/?keyword={}&lang=cht&num=10'.format(urllib.parse.quote(kw)), timeout=5)
				text = json.loads(text.text)
				for i in text:
					cursor = self.SrchCollect.find({i: {"$exists": True}}).limit(1)
					if cursor.count() > 0:
						# Key Exist
						cursor = list(cursor)[0]
						return cursor[i][self.school]

				return []
			except requests.exceptions.Timeout as e:
				return []
	def TCsearch(self):
		def Intersec(cursor1, cursor2):
			def incOrbreak(index):
				# True代表cursor2已經到最後一個了
				if index == len(cursor2)-1: return 0,True
				else:
					index += 1
					return index, False	

			# 如果有一個為空就回傳空
			if cursor1 == [] or cursor2 == []: 
				return []

			index = 0
			intersection = []
			for i in cursor1:
				while cursor2[index]['CourseCode'] < i['CourseCode']:
					index, end = incOrbreak(index)
					if end:break
				if cursor2[index]['CourseCode'] == i['CourseCode']:
					intersection.append(i)
					index, end = incOrbreak(index)
					if end:break	
				
			return intersection

		cursor1 = self.KEMSearch(self.keyword[0])
		cursor2 = self.KEMSearch(self.keyword[1])
		intersection = Intersec(cursor1, cursor2)
		if intersection == []:
			if cursor1:
				return cursor1
			elif cursor2:
				return cursor2
			else:
				return []

		for i in self.keyword[2:]:
			cursor2 = self.KEMSearch(i)
			intersection = Intersec(intersection, cursor2)
		return intersection

	def incWeight(self, code):
		''' To increment the weight of Search Result return by Search Engine. The higher weight will be return a the first of array.
			args: code
			return: None
			process: CourseCode will be list, cause Course having same code will be opened in many department, which will also be an entity in database. So those CourseCode need to increment their weight (they are all in the same document with same key)
		'''
		CourseCode = get_list_or_404(Course, code=code)
		CourseCode = tuple( i.id for i in CourseCode )
		for key in self.keyword:		
			cursor = self.SrchCollect.find({key: {"$exists": True}}).limit(1)
			document = list(cursor)[0]
			if cursor.count()==0:
				break
				
			for index, value in enumerate(document[key][self.school]):
				if value['CourseCode'] in CourseCode:
					newWeight = value['weight'] + 1
					self.SrchCollect.update({key: {"$exists": True}}, {"$set":{key+"."+self.school+'.'+str(index)+'.weight':newWeight}})

	####################Build index#########################################
	def BuildIndex(self):
		self.SrchCollect.remove({})

		for i in Course.objects.all():
			key = self.bigram(i.title)
			titleTerms = self.title2terms(i.title)
			CourseCode = i.code
			courseCode = i.code
			teacher = i.professor
			
			for k in key:
				self.BuildWithKey(k, CourseCode, i)
			for t in titleTerms:
				self.BuildWithKey(t, CourseCode, i)
			self.BuildWithKey(courseCode, CourseCode, i)
			self.BuildWithKey(teacher, CourseCode, i)

	def bigram(self, title):
		bigram = (title.split(',')[0], title.split(',')[1].replace('.', ''))
		title = re.sub(r'\(.*\)', '', title).split(',')[0].strip()
		if len(title) > 2:
			prefix = title[0]
			for i in range(1, len(title)):
				if title[i:].count(title[i]) == 1:
					bigram += (prefix + title[i],)
		return bigram

	def BuildWithKey(self, k, CourseCode, i):
		if k == '' or k==None: return
		cursor = self.SrchCollect.find({k: {"$exists": True}}).limit(1)
		if cursor.count() > 0:
			# Key Exist
			cursor = list(cursor)[0]
			if i.code not in cursor[i.school+"CourseID"]:
				################Error Detect#########
				for v in cursor[k][i.school]:       #
					if v['CourseCode'] == CourseCode:       #
						print(k)                    #
						print(i)                    #
						print(v)                    #
						print(cursor[0])            #
						raise Exception('fuck')     #
				#####################################
				self.SrchCollect.update({k: {"$exists": True}}, {'$push': {k + "."+i.school: {
								"CourseCode":CourseCode,
								"weight":0}}})
				self.SrchCollect.update({k: {"$exists":True}}, {'$push':{i.school+"CourseID": i.code}})
		else:
			# Key doesn't Exist
			post_id = self.SrchCollect.insert_one(
				{
					k:{
					i.school:[
						{
							"CourseCode":CourseCode,
							"weight":0
						}],
					},
					i.school+"CourseID":[i.code]
				}
			)
	def title2terms(self, title):
		terms = jieba.cut(title)
		return tuple(i for i in terms if len(i)>=2)
		# res = requests.get('https://onepiece.nchu.edu.tw/cofsys/plsql/Syllabus_main_q?v_strm=1051&v_class_nbr=2761')
		# soup = BeautifulSoup(res.text)
		# profile = soup.select("table[border=1]")[0].select("tr")[-2].text
		# print(profile)
		# profile = re.sub(r'\(.*?\)','', profile)
		# terms = jieba.cut(profile)
		# terms = tuple(i for i in terms if i not in self.stop_words)
		# print(terms)
