from django.conf.urls import url

from .views import views, apis

urlpatterns = [
    url(r'^$', views.timetable, name="course"),
]

urlpatterns += [
    url(r'^api/get/user$', apis.get_user),
    url(r'^api/get/course/id/(?P<course_id>\d+)$', apis.get_course_by_id),
    url(r'^api/get/course/code/(?P<course_code>\d+)$', apis.get_course_by_code),
    url(r'^api/put/selected$', apis.save_selected),
    url(r'^api/del/selected$', apis.del_selected),
]
