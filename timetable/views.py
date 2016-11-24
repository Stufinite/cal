from django.shortcuts import render
from django.http import JsonResponse
from django.template import RequestContext
from django.utils import timezone
from django.contrib.auth.decorators import login_required

import json


from userper import Userper
User = Userper('login.stufinite.faith')


def timetable(request):
    User.get_test()

    return render(request, 'timetable.html', {})


def get_user(request):
    User.get_test()
    u = {
        'username': User.username,
        'grade': User.grade,
        'major': User.major,
        'second_major': User.second_major,
        'career': User.career,
    }
    return JsonResponse(u)
