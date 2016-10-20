from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.course_zh_TW, name="course"),
]
