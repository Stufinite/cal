#!/usr/bin/env python3
import requests, json, os

class Crawler(object):
	"""docstring for Crawler"""
	def __init__(self):
		self.degree = ['U', 'G', 'D', 'N', 'O', 'W']
		self.url = 'https://onepiece.nchu.edu.tw/cofsys/plsql/json_for_course?p_career='
		try:
			os.mkdir('json')
			os.chdir('json')
			#means cd path
		except:
			print('path error, the file will be dump into the current directory')

	def truncateNewLineSpace(self, line):
		tmp = ""
		for i in line:
			if i != "\n" and i != " ":
				tmp+=i
		return tmp

	def validateTmpJson(self, tmpFile):
		# truncate invalid char to turn it into json
		jsonStr = ""
		with open(tmpFile, 'r', encoding='UTF-8') as f:
			for line in f:
				tmp = self.truncateNewLineSpace(line)
				jsonStr +=tmp
		return jsonStr
		
	def start(self):
		for d in self.degree:
			re = requests.get(self.url + d)
			re.raise_for_status()#if request has something wrong, like status code 4xx or 5xx, then it will raise an exception.

			formalFile = d + '.json'

			try:
				# dump json file, cannot ensure it's valid json. If fail, it will raise exception and then use self.validateTmpJson functin
				with open(formalFile, 'w', encoding='UTF-8') as f:
					json_str = json.dumps(re.json(), ensure_ascii=False, sort_keys=True)
					#re.json() will check whether 're' is type of json
					#json.dumps will return string.
					f.write(json_str)#f.write only accept and write string into files.
			except Exception as e:
				tmpFile = d + '_tmp.json'
				with open(tmpFile, 'w', encoding='UTF-8') as f:
					f.write(re.text)

				jsonStr = self.validateTmpJson(tmpFile)
				try:
					testJsonvalid=json.loads(jsonStr)
					formalFile = d + '.json'
					with open(formalFile, 'w', encoding='UTF-8') as f:
						f.write(jsonStr)
				except Exception as e:
					print(e)    
					raise e    


