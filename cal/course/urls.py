# -*- coding: utf-8 -*-
from django.conf.urls import url
from course import views
urlpatterns = [
	url(r'^CourseOfDept/$', views.CourseOfDept, name='CourseOfDept'),
]