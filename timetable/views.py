from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponseRedirect


from userper import Userper
User = Userper('login.stufinite.faith')


def timetable(request):
    from urllib.error import HTTPError
    if not request.session.session_key:
        request.session.save()
    try:
        # User.get(request.session.session_key)
        User.get_test()
    except HTTPError:
        return HttpResponseRedirect('https://login.stufinite.faith')

    stufinite = {}
    if User.username != 'None':
        stufinite['is_authenticated'] = True
        stufinite['username'] = User.username
    else:
        stufinite['is_authenticated'] = False

    return render(request, 'timetable.html', {'stufinite': stufinite})


def get_user(request):
    u = {
        'username': User.username,
        'grade': 3,
        'major': User.major,
        'second_major': User.second_major,
        'career': User.career,
    }
    return JsonResponse(u)


def get_selected(reqeust):
    pass


def save_selected(request):
    pass
