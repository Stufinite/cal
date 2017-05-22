from django.http import JsonResponse, HttpResponseRedirect, Http404, HttpResponse

from timetable.models import Department, Course, SelectedCourse
from djangoApiDec.djangoApiDec import queryString_required

import cal.settings as SETTINGS


def init_user(request):
    from userper import Userper
    User = Userper('login.campass.com.tw')

    from urllib.error import HTTPError
    if not request.session.session_key:
        request.session.save()
    try:
        if SETTINGS.DEBUG:
            User.get_test()
        else:
            User.get(request.session.session_key)
    except HTTPError:
        return HttpResponseRedirect('https://login.campass.com.tw')
    u = {
        'is_authenticated': True,
        'username': User.username,
        'grade': User.grade,
        'major': User.major,
        'second_major': User.second_major,
        'career': User.career,
    }
    return u


def get_user(request):
    user = init_user(request)
    if isinstance(user, HttpResponseRedirect):
        return user

    user['selected'] = get_selected_course(user)
    user['dept_id'] = get_department_id(user)

    return JsonResponse(user)


@queryString_required(['user'])
def get_friend_selected_course(request):
    user = request.GET['user']
    return JsonResponse(get_selected_course({'username': user}), safe=False)


def get_department_id(user):
    dept_id = []

    for d in Department.objects.filter(degree=user['career']):
        if (d.title.split(',')[0] == user['major']):
            dept_id.append(d.code)

    if user['second_major'] != '':
        for d in Department.objects.filter(degree=user['career']):
            if (d.title.split(',')[0] == user['second_major']):
                dept_id.append(d.code)

    return dept_id


def get_selected_course(user):
    try:
        result = list(map(
            lambda c: c.code,
            SelectedCourse.objects.filter(user=user['username'])
        ))
        return result
    except:
        return []


def get_department(request):
    user = init_user(request)
    if isinstance(user, HttpResponseRedirect):
        return user

    try:
        result = {}
        for d in Department.objects.filter(degree=user['career']).order_by('code'):
            try:
                result[d.degree].append({
                    'code': d.code,
                    'title': {
                        'zh_TW': d.title.split(',')[0],
                        'en_US': d.title.split(',')[1],
                    },
                })
            except KeyError:
                result[d.degree] = []
                result[d.degree].append({
                    'code': d.code,
                    'title': {
                        'zh_TW': d.title.split(',')[0],
                        'en_US': d.title.split(',')[1],
                    },
                })

        return JsonResponse(result, safe=False)
    except:
        raise Http404("Page does not exist")


def get_course_by_code(request, course_code):
    try:
        result = list(map(
            lambda c: {
                "code": c.code,
                "credits": c.credits,
                "title": {
                    "zh_TW": c.title.split(",")[0],
                    "en_US": c.title.split(",")[1],
                },
                "professor": c.professor,
                "department": c.department,
                "time": c.time,
                "location": c.location,
                "intern_location": c.intern_location,
                "prerequisite": c.prerequisite,
                "note": c.note,
                "discipline": c.discipline,
            },
            Course.objects.filter(code=course_code)
        ))

        return JsonResponse(result, safe=False)
    except:
        raise Http404("Page does not exist")


def del_selected(request):
    user = init_user(request)
    if isinstance(user, HttpResponseRedirect):
        return user

    if request.method == 'POST':
        try:
            code = request.POST.get('code')
            SelectedCourse.objects.filter(
                code=code, user=user['username']).delete()
            return JsonResponse({"state": "ok"})
        except:
            raise Http404("Page does not exist")
    else:
        raise Http404("Page does not exist")


def save_selected(request):
    user = init_user(request)
    if isinstance(user, HttpResponseRedirect):
        return user

    if request.method == 'POST':
        try:
            text = request.POST.get('text')
            for code in text.split(','):
                sc, created = SelectedCourse.objects.get_or_create(
                    code=code, user=user['username'])
                if not created:
                    sc.save()
            return JsonResponse({"state": "ok"})
        except:
            raise Http404("Page does not exist")
    else:
        raise Http404("Page does not exist")


def save_course(request):
    if request.method == 'POST':
        user_id = request.POST.get('id')
        selected = request.POST.get('selected').split(',')
        semester = request.POST.get('semester')
        try:
            SelectedCourse.objects.filter(user_id=user_id).delete()
            for code in selected:
                if not code.isdigit():
                    raise Http404("Page does not exist")
                sc, created = SelectedCourse.objects.get_or_create(
                    code=code, user_id=user_id, semester=semester)
                if not created:
                    sc.save()
        except:
            raise Http404("Page does not exist")
        return JsonResponse({"state": "ok"})
    else:
        raise Http404("Page does not exist")
