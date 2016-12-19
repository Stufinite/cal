#!/usr/bin/env python3
import json
try:
	with open('U.json', 'r', encoding='UTF-8') as f:
	    json.load(f)
	with open('G.json', 'r', encoding='UTF-8') as f:
	    json.load(f)
	with open('D.json', 'r', encoding='UTF-8') as f:
	    json.load(f)
	with open('N.json', 'r', encoding='UTF-8') as f:
	    json.load(f)
	with open('O.json', 'r', encoding='UTF-8') as f:
	    json.load(f)
	with open('W.json', 'r', encoding='UTF-8') as f:
	    json.load(f)
except Exception as e:
	raise e