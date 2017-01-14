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

	def getByDept(self, dept, grade):
		CourseDict = self.Cursor2Dict(self.db['CourseOfDept'].find({ "$and":[{"school":self.school}, {'dept':dept}] },{'course.obligatory.{}'.format(grade):1, 'course.optional.{}'.format(grade):1, '_id':False}).limit(1))
		return CourseDict

	def getByTime(self, day, time):
		CourseDict = self.Cursor2Dict(self.db['CourseOfTime'].find({'school':self.school, 'day':int(day), 'time':int(time)}, {'value':1, '_id':False}).limit(1))
		return CourseDict.get('value', [])

@queryString_required(['dept', 'grade', 'school'])
def CourseOfDept(request):
	"""
		Generate list of obligatory and optional course of specific Dept.
	"""
	dept = request.GET['dept']
	grade = request.GET['grade']
	school = request.GET['school']
	c = Course(school=school)
	return JsonResponse(c.getByDept(dept=dept, grade=grade), safe=False)

@queryString_required(['day', 'time', 'school'])
def TimeOfCourse(request):
	"""
		Generate list of obligatory and optional course of specific Dept.
	"""
	day = request.GET['day']
	time = request.GET['time']
	school = request.GET['school']
	c = Course(school=school)
	return JsonResponse(c.getByTime(day=day, time=time), safe=False)
