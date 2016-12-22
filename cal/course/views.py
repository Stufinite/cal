# -*- coding: utf-8 -*-
from django.http import JsonResponse
from djangoApiDec.djangoApiDec import queryString_required
from pymongo import MongoClient

class Course(object):
	"""docstring for Course"""
	def __init__(self, dept, school, uri=None):
		self.dept = dept
		self.school = school
		self.collect = MongoClient(uri)['timetable']['CourseOfDept']

	def Cursor2Dict(self, cursor):
		if cursor.count() == 0:
			return {}
		return list(cursor)[0]

	def getByDept(self):
		CourseDict = self.Cursor2Dict(self.collect.find({ "$and":[{"school":self.school}, {self.dept:{"$exists":True}}] }))

		return CourseDict.get(self.dept, {"error":"invalid Dept Code"})

@queryString_required(['dept', 'school'])
def CourseOfDept(request):
	"""
		Generate list of obligatory and optional course of specific Dept.
	"""
	dept = request.GET['dept']
	school = request.GET['school']
	c = Course(dept, school)
	return JsonResponse(c.getByDept(), safe=False)