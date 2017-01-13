#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
from pymongo import MongoClient
class import2Mongo(object):
	"""docstring for import2Mongo"""
	def __init__(self, uri=None):
		self.JSONdir = 'json'
		self.degree2Chi = {"U":"學士班", "G":"碩士班","D":"博士班","N":"進修學士班","W":"碩專班", "O":"全校共同"}
		self.deptSet = set()
		self.client = MongoClient(uri)
		self.db = self.client['timetable']
		self.DeptCollect = self.db['CourseOfDept']
		self.CourseOfTime = self.db['CourseOfTime']
		self.chgTable = dict(tuple(tuple(dept['name'], dept['value'])for degree in json.load(open('fallback/json/department.json', 'r')) for dept in degree['department']))

	def AddHeader(self, document, degree):
		document['degree'] = degree
		document['school'] = "NCHU"
		return document

	def BuildByDept(self, jsonDict):
		def getClass(grade):
			if len(grade) == 1:
				return 'ClassA', grade
			if grade == "":
				return "ClassA", '0'
			return 'Class'+str.capitalize(grade[-1]), grade[0]

		def getObliAttr(obligat):
			if obligat:
				return 'obligatory'
			return 'optional'

		def getDeptCode(deptName, grade):
			if len(grade) > 1:
				deptName = deptName + ' ' + grade[-1].upper()

			return self.chgTable.get(deptName, False)
			# for i in self.chgTable:
			# 	if i['degree'] == self.degree2Chi[degree]:
			# 		for j in i['department']:
			# 			if j['name'] == deptName or deptName in j['name']:
			# 				return j['value']
			# print(degree, deptName)
			# return False

		result = {}
		for i in jsonDict:
			dept = getDeptCode(i['for_dept'], i['class'])
			# dept == False means getDeptCode has error
			if dept == False: continue
			code = i['code']
			grade = i['class']
			className, grade = getClass(grade)
			obligat = i['obligatory_tf']
			oblAttr = getObliAttr(obligat)

			result.setdefault(dept, 
				{
					'obligatory':{},
					'optional':{}
				}
			)
			# if dept not in self.deptSet:
			# 	result[dept]={
			# 			'obligatory':{},
			# 			'optional':{}
			# 		}
			# 	self.deptSet.add(dept)
			result[dept][oblAttr].setdefault(grade, []).append(code)

		resultList = tuple( dict(dept=dept, course=course, school='NCHU') for dept, course in result.items())
		self.DeptCollect.insert(resultList)

	def BuildByTime(self, jsonDict):
		result = {
			"1":{"1":[],"2":[],"3":[],"4":[],"5":[],"6":[],"7":[],"8":[],"9":[],"10":[],"11":[],"12":[],"13":[]},
			"2":{"1":[],"2":[],"3":[],"4":[],"5":[],"6":[],"7":[],"8":[],"9":[],"10":[],"11":[],"12":[],"13":[]},
			"3":{"1":[],"2":[],"3":[],"4":[],"5":[],"6":[],"7":[],"8":[],"9":[],"10":[],"11":[],"12":[],"13":[]},
			"4":{"1":[],"2":[],"3":[],"4":[],"5":[],"6":[],"7":[],"8":[],"9":[],"10":[],"11":[],"12":[],"13":[]},
			"5":{"1":[],"2":[],"3":[],"4":[],"5":[],"6":[],"7":[],"8":[],"9":[],"10":[],"11":[],"12":[],"13":[]},
			"6":{"1":[],"2":[],"3":[],"4":[],"5":[],"6":[],"7":[],"8":[],"9":[],"10":[],"11":[],"12":[],"13":[]},
			"7":{"1":[],"2":[],"3":[],"4":[],"5":[],"6":[],"7":[],"8":[],"9":[],"10":[],"11":[],"12":[],"13":[]}
		}
		for course in jsonDict['course']:
			for time in course['time_parsed']:
				day = str(time['day'])
				for t in time['time']:
					if course['code'] not in result[day][str(t)]:
						result[day][str(t)].append(course['code'])
		return result

	def save2DB(self):
		def getJson(degree):
			return json.load(open(self.JSONdir+'/'+degree+'.json', 'r', encoding='utf8'))

		self.DeptCollect.remove({})
		self.CourseOfTime.remove({})

		AllJson = tuple()
		for degree in self.degree2Chi:
			AllJson += tuple(_ for _ in getJson(degree)['course'])

		self.BuildByDept(AllJson)
		self.BuildByTime(jsonDict)
		# if degree != "O":
		# 	deptDoc = self.BuildByDept(degree, jsonDict)
		# 	deptDoc = self.AddHeader(deptDoc, degree)
		# 	self.DeptCollect.update({ "$and":[{"school":"NCHU"}, {'degree':degree}] }, deptDoc, upsert=True)

		# timeDoc = self.BuildByTime(degree, jsonDict)
		# timeDoc = self.AddHeader(timeDoc, degree)
		# self.CourseOfTime.update({ "$and":[{"school":"NCHU"}, {'degree':degree}] }, timeDoc, upsert=True)
