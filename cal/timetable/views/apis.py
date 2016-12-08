from django.http import JsonResponse, HttpResponseRedirect, Http404

from timetable.views.views import init_user
from timetable.models import Department, Course, SelectedCourse


def get_user(request):
    user = init_user(request)
    if isinstance(user, HttpResponseRedirect):
        return user

    return JsonResponse(user)


def get_department(request):
    user = init_user(request)
    if isinstance(user, HttpResponseRedirect):
        return user

    # result = []
    # for d in Department.objects.filter(degree=user['career']).order_by('code'):
    #     result.append({
    #         'code': d.code,
    #         'title_zh': d.title.split(',')[0],
    #         'title_en': d.title.split(',')[1],
    #     })

    try:
        result = list(map(
            lambda d: {
                'code': d.code,
                'title_zh': d.title.split(',')[0],
                'title_en': d.title.split(',')[1],
            },
            Department.objects.filter(degree=user['career']).order_by('code')
        ))  # just practicing

        return JsonResponse(result, safe=False)
    except:
        raise Http404("Page does not exist")


def get_selected(request):
    user = init_user(request)
    if isinstance(user, HttpResponseRedirect):
        return user

    if request.method == 'GET':
        try:
            result = list(map(
                lambda c: c.course.code,
                SelectedCourse.objects.filter(user=user['username'])
            ))
            return JsonResponse(result, safe=False)
        except:
            raise Http404("Page does not exist")
    else:
        raise Http404("Page does not exist")


def del_selected(request):
    user = init_user(request)
    if isinstance(user, HttpResponseRedirect):
        return user

    if request.method == 'POST':
        try:
            code = request.POST.get('code')
            course = Course.objects.get(code=code)
            SelectedCourse.objects.filter(
                course=course, user=user['username']).delete()
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
                    course=Course.objects.get(code=code), user=user['username'])
                if not created:
                    sc.save()
            return JsonResponse({"state": "ok"})
        except:
            raise Http404("Page does not exist")
    else:
        raise Http404("Page does not exist")


def build_department(request):
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
                    # print("{} {} {} {}".format(dept_by_degree["degree"],
                    #     dept["zh_TW"], dept["en_US"], dept["value"]))
                    d, created = Department.objects.get_or_create(
                        degree=dept_by_degree["degree"],
                        code=dept["value"],
                        title="{},{}".format(dept["zh_TW"], dept["en_US"])
                    )
                    if not created:
                        d.save()
        return JsonResponse({"state": "ok"})


def build_course(request):
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
                    # print(c)
                    d, created = Course.objects.get_or_create(
                        school='NCHU',
                        semester="1051",
                        code=c['code'],
                        for_class=c['class'],
                        credits=c['credits'],
                        title='{},{}'.format(
                            c['title_parsed']['zh_TW'],
                            c['title_parsed']['en_US']
                        ),
                        department=c['department'],
                        professor=c['professor'],
                        time=c['time'],
                        location=c['location'][0],
                        obligatory=c['obligatory_tf'],
                        language=c['language'],
                        duration=c['year'],
                        prerequisite=c['prerequisite'],
                        note=c['note']
                    )
                    if not created:
                        d.save()
        return JsonResponse({"state": "ok"})
