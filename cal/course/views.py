# -*- coding: utf-8 -*-
from django.http import JsonResponse
from djangoApiDec.djangoApiDec import queryString_required
from pymongo import MongoClient

class Course(object):
	"""docstring for Course"""
	def __init__(self, school, uri=None):
		self.school = school
		self.db = MongoClient(uri)['timetable']

	def Cursor2Dict(self, cursor):
		if cursor.count() == 0:
			return {}
		return list(cursor)[0]

	def getByDept(self, dept):
		CourseDict = self.Cursor2Dict(self.db['CourseOfDept'].find({ "$and":[{"school":self.school}, {'dept':dept}] },{'_id':False}).limit(1))
		return CourseDict['course']

	def getByTime(self, day, time, degree, dept):
		CourseDict = self.Cursor2Dict(self.db['CourseOfTime'].find({'school':self.school, 'day':int(day), 'time':int(time)}, {'value.'+degree+'.'+dept:1, '_id':False}).limit(1))
		return CourseDict.get('value', [])

@queryString_required(['dept', 'school'])
def CourseOfDept(request):
	"""
		Generate list of obligatory and optional course of specific Dept.
	"""
	dept = request.GET['dept']
	school = request.GET['school']
	c = Course(school=school)
	return JsonResponse(c.getByDept(dept=dept), safe=False)

@queryString_required(['day', 'time', 'school', 'degree', 'dept'])
def TimeOfCourse(request):
	"""
		Generate list of obligatory and optional course of specific Dept.
	"""
	day = request.GET['day']
	time = request.GET['time']
	school = request.GET['school']
	degree = request.GET['degree']
	dept = request.GET['dept']
	c = Course(school=school)
	return JsonResponse(c.getByTime(day=day, time=time, degree=degree, dept=dept), safe=False)
