from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponseRedirect

from userper import Userper


def init_user(request):
    User = Userper('login.stufinite.faith')

    from urllib.error import HTTPError
    if not request.session.session_key:
        request.session.save()
    try:
        User.get(request.session.session_key)
        # User.get_test()
    except HTTPError:
        return HttpResponseRedirect('https://login.stufinite.faith')

    u = {
        'is_authenticated': True,
        'username': User.username,
        'grade': User.grade,
        'major': User.major,
        'second_major': User.second_major,
        'career': User.career,
    }

    return u


def timetable(request):
    user = init_user(request)
    if isinstance(user, HttpResponseRedirect):
        return user

    return render(request, 'timetable.html', {'user': user})
