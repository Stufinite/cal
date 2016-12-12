from django.shortcuts import render
from django.http import JsonResponse
from timetable.models import Course
from pymongo import MongoClient
import re

# Create your views here.
def search(request):
	return JsonResponse({}, safe=False)

def InvertedIndex(request):
	client = MongoClient()
	db = client['timetable']
	SrchCollect = db['CourseSearch']
	idList = db['idSet']
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
				# a = list(cursor)
				# for v in a[0][k][i.school]:
				# 	if v['DBid'] == courseid:
				# 		print(k)
				# 		print(i)
				# 		print(v)
				# 		print(a[0])
				# 		raise Exception('fuck')
				SrchCollect.update({k: {"$exists": True}}, {'$push': {k + "."+i.school: {
								"DBid":courseid,
								"weight":0}
					}})
			else:
				# Key doesn't Exist
				post_id = SrchCollect.insert_one(
					{
						k:{
						i.school:[
							{
								"DBid":courseid,
								"weight":0
							}]
						}
					}
				)
	return JsonResponse({"build Inverted index success":1}, safe=False)