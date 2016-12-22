# -*- coding: utf-8 -*-
from django.http import JsonResponse
from djangoApiDec.djangoApiDec import queryString_required
from pymongo import MongoClient

class Course(object):
	"""docstring for Course"""
	def __init__(self, dept, uri=None):
		self.dept = dept
		self.collect = MongoClient(uri)['timetable']['CourseOfDept']

	def Cursor2Dict(self, cursor):
		if cursor.count() == 0:
			return {}
		return list(cursor)[0]

	def getByDept(self):
		CourseDict = self.Cursor2Dict(self.collect.find({self.dept:{"$exists":True}}).limit(1))
		return CourseDict.get(self.dept, {"error":"invalid Dept Code"})

@queryString_required(['dept'])
def CourseOfDept(request):
	"""
		Generate list of obligatory and optional course of specific Dept.
	"""
	dept = request.GET['dept']
	c = Course(dept)
	return JsonResponse(c.getByDept(), safe=False)