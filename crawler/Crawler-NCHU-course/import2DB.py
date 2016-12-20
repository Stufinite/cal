#!/usr/bin/env python3
# -*- coding: utf-8 -*-
class import2Mongo(object):
	"""docstring for import2Mongo"""
	def __init__(self):
		self.JSONdir = 'json'
		self.degree = ['U.json', 'G.json', 'D.json', 'N.json', 'O.json', 'W.json']
		self.deptSet = set()
		
	def parseJson(self):
		import json
		def getJson(degree):
			with open(self.JSONdir+'/'+degree, 'r', encoding='utf8') as f:
				return json.load(f)

		def getClass(grade):
			if len(grade) == 1:
				return 'ClassA', grade
			return 'Class'+str.capitalize(grade[-1]), grade[0]

		def getObliAttr(obligat):
			if obligat:
				return 'obligatory'
			return 'optional'

		for degree in self.degree:
			jsonDict = getJson(degree)
			result = {}
			#這邊需要修改，因為學校沒有完全按照學至分類乾淨，所以才需要每次都把set清空####
			self.deptSet = set()
			#############################
			for i in jsonDict['course']:
				dept = i['for_dept']
				code = i['code']
				grade = i['class']
				className, grade = getClass(grade)
				obligat = i['obligatory_tf']
				oblAttr = getObliAttr(obligat)
				if dept not in self.deptSet:
					result[dept]={
							'obligatory':{'ClassA':{}},
							'optional':{'ClassA':{}}
						}
					self.deptSet.add(dept)
				result[dept]['obligatory'].setdefault(className, {})
				result[dept]['optional'].setdefault(className, {})
				result[dept][oblAttr][className].setdefault(grade, []).append(code)
			with open(degree+'.json', 'w', encoding='utf-8') as f:
				json.dump(result, f)
	# def transition(self):

i = import2Mongo()
i.parseJson()