from django.shortcuts import render
from django.http import JsonResponse
from timetable.models import Course
from pymongo import MongoClient
from djangoApiDec.djangoApiDec import queryString_required
import re, urllib, requests, json, queue

class SearchOb(object):
	"""docstring for SearchOb"""
	def __init__(self, keyword, school, uri=None):
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
			return tuple( i for i in list(cursor)[0][kw][self.school])
		else:
			text = requests.get('http://140.120.13.243:32785/api/kemApi/?keyword={}&lang=cht&num=10'.format(urllib.parse.quote(kw)))
			text = json.loads(text.text)
			for i in text:
				cursor = self.SrchCollect.find({i: {"$exists": True}}).limit(1)
				if cursor.count() > 0:
					# Key Exist
					cursor = list(cursor)[0]
					return tuple( j for j in cursor[i][self.school])
	def TCsearch(self):
		def Intersec(cursor1, cursor2):
			index = 0
			intersection = []
			for i in cursor1:
				while cursor2[index]['DBid'] < i['DBid']:
					index += 1
				if cursor2[index]['DBid'] == i['DBid']:
					intersection.append(i)
					index += 1
				if index == len(cursor2): break
			return intersection

		topic1, topic2 = self.keyword[0:2]
		cursor1 = self.KEMSearch(topic1)
		cursor2 = self.KEMSearch(topic2)
		intersection = Intersec(cursor1, cursor2)

		for i in self.keyword[2:]:
			cursor2 = self.KEMSearch(i)
			intersection = Intersec(intersection, cursor2)
		return intersection

# Create your views here.
@queryString_required(['keyword', 'school'])
def search(request):
	keyword = request.GET['keyword']
	school = request.GET['school']
	sob = SearchOb(keyword, school)
				
	return JsonResponse(sob.getResult(), safe=False)

def InvertedIndex(request):
	client = MongoClient()
	db = client['timetable']
	SrchCollect = db['CourseSearch']
	def bigram(title):
		bigram = (title.split(',')[0], title.split(',')[1].replace('.', ''))
		title = re.sub(r'\(.*\)', '', title).split(',')[0].strip()
		if len(title) > 2:
			prefix = title[0]
			for i in range(1, len(title)):
				if title[i:].count(title[i]) == 1:
					bigram += (prefix + title[i],)
		return bigram

	for i in Course.objects.all():
		key = bigram(i.title)
		courseid = i.id
		for k in key:
			cursor = SrchCollect.find({k: {"$exists": True}}).limit(1)
			if cursor.count() > 0:
				# Key Exist
				cursor = list(cursor)[0]
				if i.code not in cursor[i.school+"CourseID"]:
					################Error Detect#########
					for v in cursor[0][k][i.school]:    #
						if v['DBid'] == courseid:       #
							print(k)                    #
							print(i)                    #
							print(v)                    #
							print(cursor[0])            #
							raise Exception('fuck')     #
					#####################################
					SrchCollect.update({k: {"$exists": True}}, {'$push': {k + "."+i.school: {
									"DBid":courseid,
									"weight":0}}})
					SrchCollect.update({k: {"$exists":True}}, {'$push':{i.school+"CourseID": i.code}})
			else:
				# Key doesn't Exist
				post_id = SrchCollect.insert_one(
					{
						k:{
						i.school:[
							{
								"DBid":courseid,
								"weight":0
							}],
						},
						i.school+"CourseID":[i.code]
					}
				)
	return JsonResponse({"build Inverted index success":1}, safe=False)