from django.conf.urls import url

from .views import views, apis

urlpatterns = [
    url(r'^$', views.timetable, name="course"),
]

urlpatterns += [
    url(r'^api/get/user$', apis.get_user),
    url(r'^api/get/frienduser$', apis.get_friend_selected_course),
    url(r'^api/get/course/code/(?P<course_code>\d+)$', apis.get_course_by_code),
    url(r'^api/get/dept$', apis.get_department),
    url(r'^api/save_course$', apis.save_course),
]
