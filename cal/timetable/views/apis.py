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


def build_department():
    from cal import settings
    if not settings.DEBUG:
        raise Http404("Page does not exist")
    else:
        from cal import settings
        import json
        with open(settings.STATICFILES_DIRS[0] + '/timetable/json/department.json', 'r') as f:
            data = json.loads(f.read())
            for dept_by_degree in data:
                for dept in dept_by_degree["department"]:
                    print("{} {} {} {}".format(dept_by_degree["degree"],
                                               dept["zh_TW"], dept["en_US"], dept["value"]))
                    d, created = Department.objects.get_or_create(
                        degree=dept_by_degree["degree"],
                        code=dept["value"],
                        title="{},{}".format(dept["zh_TW"], dept["en_US"])
                    )
                    if not created:
                        d.save()
        return JsonResponse({"state": "ok"})


def build_course():
    Course.objects.all().delete()
    from cal import settings
    if not settings.DEBUG:
        raise Http404("Page does not exist")
    else:
        from cal import settings
        from os import listdir
        import json
        onlycourse = [x for x in listdir(settings.STATICFILES_DIRS[
            0] + '/timetable/json/') if x != 'department.json']
        for filename in onlycourse:
            with open(settings.STATICFILES_DIRS[0] + '/timetable/json/' + filename, 'r') as f:
                data = json.loads(f.read())
                for c in data["course"]:
                    try:
                        print(c['title'], c['professor'])
                        time = ''
                        for i in c['time_parsed']:
                            time += str(i['day']) + '-'
                            for j in i['time']:
                                time += str(j) + '-'
                            time = time[:-1]
                            time += ','
                        d, created = Course.objects.get_or_create(
                            school='NCHU',
                            semester="1051",
                            code=c['code'],
                            credits=c['credits'],
                            title='{},{}'.format(
                                c['title_parsed']['zh_TW'],
                                c['title_parsed']['en_US']
                            ),
                            department=c['department'],
                            professor=c['professor'],
                            time=time[:-1],
                            intern_location=c['intern_location'][0],
                            location=c['location'][0],
                            obligatory=c['obligatory_tf'],
                            language=c['language'],
                            prerequisite=c['prerequisite'],
                            note=c['note'],
                            discipline=c['discipline'],
                        )
                        if not created:
                            d.save()
                    except:
                        pass
        return JsonResponse({"state": "ok"})
