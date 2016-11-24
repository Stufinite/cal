from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.timetable, name="course"),
]

urlpatterns += [
    url(r'^api/get/user$', views.get_user, name="get_user"),
]
