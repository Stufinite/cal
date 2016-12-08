from django.conf.urls import url

from .views import views, apis

urlpatterns = [
    url(r'^$', views.timetable, name="course"),
]

urlpatterns += [
    url(r'^api/get/user$', apis.get_user),
    url(r'^api/get/dept$', apis.get_department),
]

urlpatterns += [
    url(r'^control_api/dept$', apis.build_department),
    url(r'^control_api/course$', apis.build_course),
]
