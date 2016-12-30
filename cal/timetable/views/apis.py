from django.http import JsonResponse, HttpResponseRedirect, Http404, HttpResponse

from timetable.views.views import init_user
from timetable.models import Department, Course, SelectedCourse


def get_user(request):
    user = init_user(request)
    if isinstance(user, HttpResponseRedirect):
        return user

    user['selected'] = get_selected_course(user)
    user['dept_id'] = get_department_id(user)

    return JsonResponse(user)


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
