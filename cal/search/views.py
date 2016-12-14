from django.shortcuts import render
from django.http import JsonResponse
from timetable.models import Course
from pymongo import MongoClient
from djangoApiDec.djangoApiDec import queryString_required
import re, urllib, requests, json

# Create your views here.
@queryString_required(['keyword', 'school'])
def search(request):
	keyword = request.GET['keyword']
	school = request.GET['school']
	client = MongoClient()
	db = client['timetable']
	SrchCollect = db['CourseSearch']

	cursor = SrchCollect.find({keyword: {"$exists": True}}).limit(1)
	result = []
	if cursor.count() > 0:
		# Key Exist
		result = tuple( i for i in list(cursor)[0][keyword][school])
	else:
		# Key doesn't Exist
		text = requests.get('http://140.120.13.243:32785/api/kcmApi/?keyword={}&lang=cht&num=10'.format(urllib.parse.quote(keyword)))
		text = json.loads(text.text)
		for i in text:
			result.append(i)
	return JsonResponse(result, safe=False)

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
				# for v in cursor[0][k][i.school]:
				# 	if v['DBid'] == courseid:
				# 		print(k)
				# 		print(i)
				# 		print(v)
				# 		print(cursor[0])
				# 		raise Exception('fuck')
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