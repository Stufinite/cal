# -*- coding: utf-8 -*-
from django.apps import AppConfig
import re, urllib, requests, json, jieba, pyprind
from timetable.models import Course

class SearchConfig(AppConfig):
    name = 'search'
    
class SearchOb(object):
	"""docstring for SearchOb"""
	def __init__(self, keyword="", school=None, uri=None):
		from pymongo import MongoClient
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
		from functools import reduce 

		cursor = self.SrchCollect.find({'key':kw}, {self.school:1, '_id':False}).limit(1)
		if cursor.count() > 0:
			# Key Exist
			return list(cursor)[0][self.school]
		else:
			try:
				kcm = json.loads(requests.get('http://api.udic.cs.nchu.edu.tw/api/kcm/?keyword={}&lang=cht&num=200'.format(urllib.parse.quote(kw))).text)
				kem = json.loads(requests.get('http://api.udic.cs.nchu.edu.tw/api/kem/?keyword={}&lang=cht&num=200'.format(urllib.parse.quote(kw)), timeout=0.07).text)


				for i in reduce(lambda x, y: x + y, zip(a, b)):
					cursor = self.SrchCollect.find({'key':i[0]}, {self.school:1, '_id':False}).limit(1)
					if cursor.count() > 0:
						# Key Exist
						return list(cursor)[0][self.school]

				return []
			except requests.exceptions.Timeout as e:
				print(e)
				return []

	def TCsearch(self):
		cursor1 = self.KEMSearch(self.keyword[0])
		cursor2 = self.KEMSearch(self.keyword[1])
		intersection = set(cursor1).intersection(cursor2)
		if intersection == []:
			if cursor1:
				return cursor1
			elif cursor2:
				return cursor2
			else:
				return []

		for i in self.keyword[2:]:
			cursor2 = self.KEMSearch(i)
			intersection = intersection.intersection(cursor2)
		return list(intersection)

	def incWeight(self, code):
		from django.shortcuts import get_list_or_404
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
		import pymongo

		self.SrchCollect.remove({})
		def bigram(title):
			bigram = (title.split(',')[0], title.split(',')[1].replace('.', ''))
			title = re.sub(r'\(.*\)', '', title.split(',')[0]).split()[0].strip()
			bigram += (title, )
			if len(title) > 2:
				prefix = title[0]
				for i in range(1, len(title)):
					if title[i:].count(title[i]) == 1:
						bigram += (prefix + title[i],)
			return bigram

		tmp = dict()
		for i in pyprind.prog_percent(Course.objects.all()):
			key = bigram(i.title)
			titleTerms = self.title2terms(i.title)
			CourseCode = i.code

			for k in key:
				tmp.setdefault(k, set()).add(CourseCode)
			for t in titleTerms:
				tmp.setdefault(t, set()).add(CourseCode)
			tmp.setdefault(i.professor, set()).add(CourseCode)
			tmp.setdefault(CourseCode, set()).add(CourseCode)

		result = tuple( {'key':key, self.school:list(value)} for key, value in tmp.items() if key != '' and key!=None)
		self.SrchCollect.insert(result)
		self.SrchCollect.create_index([("key", pymongo.HASHED)])

	def title2terms(self, title):
		terms = jieba.cut(title)
		return tuple(i for i in terms if len(i)>=2)