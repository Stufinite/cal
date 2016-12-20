#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from crawler import Crawler
from import2DB import import2Mongo
if __name__ == "__main__":
	c = Crawler()
	c.start()
	i = import2Mongo()
	i.save2DB()