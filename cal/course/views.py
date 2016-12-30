# -*- coding: utf-8 -*-
from django.http import JsonResponse
from djangoApiDec.djangoApiDec import queryString_required
from pymongo import MongoClient

class Course(object):
	"""docstring for Course"""
	def __init__(self, school, uri=None, degree=None, dept=None, day=None, time=None):
		self.degree = degree
		self.dept = dept
		self.day = day
		self.time = time
		self.school = school
		self.db = MongoClient(uri)['timetable']

	def Cursor2Dict(self, cursor):
		if cursor.count() == 0:
			return {}
		return list(cursor)[0]

	def getByDept(self):
		CourseDict = self.Cursor2Dict(self.db['CourseOfDept'].find({ "$and":[{"school":self.school}, {self.dept:{"$exists":True}}] },
		 {self.dept:1, '_id': False}).limit(1))
		return CourseDict[self.dept]

	def getByTime(self):
		CourseDict = self.Cursor2Dict(self.db['CourseOfTime'].find({ "$and":[{"school":self.school}, {"degree": self.degree}] }
			,{"{}.{}".format(self.day, self.time):1, '_id': False}
			).limit(1))

		try:
			CourseDict = CourseDict[self.day][self.time]
		except Exception as e:
			CourseDict = {"error":"invalid day or time or degree or school"}
		return CourseDict

@queryString_required(['dept', 'school'])
def CourseOfDept(request):
	"""
		Generate list of obligatory and optional course of specific Dept.
	"""
	dept = request.GET['dept']
	school = request.GET['school']
	c = Course(dept=dept, school=school)
	return JsonResponse(c.getByDept(), safe=False)

@queryString_required(['degree', 'day', 'time', 'school'])
def TimeOfCourse(request):
	"""
		Generate list of obligatory and optional course of specific Dept.
	"""
	degree = request.GET['degree']
	day = request.GET['day']
	time = request.GET['time']
	school = request.GET['school']
	c = Course(degree=degree, day=day, time=time, school=school)
	other = Course(degree='O', day=day, time=time, school=school)
	return JsonResponse(c.getByTime() + other.getByTime(), safe=False)
