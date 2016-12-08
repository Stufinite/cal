from django.http import JsonResponse

from timetable.views.views import init_user
from timetable.models import Department, Course, SelectedCourse


def get_user(request):
    user = init_user(request)
    if isinstance(user, HttpResponseRedirect):
        return user

    return JsonResponse(user)


def get_selected(reqeust):
    pass


def save_selected(request):
    pass
