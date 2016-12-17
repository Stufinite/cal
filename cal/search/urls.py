# -*- coding: utf-8 -*-
from django.conf.urls import url
from search import views
urlpatterns = [
	url(r'^$', views.search, name='search'),
	url(r'^InvertedIndex/$', views.InvertedIndex, name='InvertedIndex'),
	url(r'^recWeight/$', views.recWeight, name='recWeight'),
]