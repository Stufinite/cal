from django.http import JsonResponse, HttpResponseRedirect, Http404

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


def build_department(request):
    user = init_user(request)
    if isinstance(user, HttpResponseRedirect):
        return user
    if user['username'] != 'root':
        raise Http404("Page does not exist")
    else:
        from cal import settings
        import json
        with open(settings.STATICFILES_DIRS[0] + '/timetable/json/department.json', 'r') as f:
            data = json.loads(f.read())
            for dept_by_degree in data:
                for dept in dept_by_degree["department"]:
                    print("{} {} {} {}".format(dept_by_degree["degree"], dept["zh_TW"], dept["en_US"], dept["value"]))
                    d, created = Department.objects.get_or_create(degree=dept_by_degree["degree"], code=dept[
                                                                  "value"], title="{},{}".format(dept["zh_TW"], dept["en_US"]))
                    if not created:
                        d.save()
        return JsonResponse({"state": "ok"})


def build_course(request):
    user = init_user(request)
    if isinstance(user, HttpResponseRedirect):
        return user
    if user['username'] != 'root':
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
                    print(c)
                    d, created = Course.objects.get_or_create(
                        school='NCHU',
                        semester="1051",
                        code=c['code'],
                        for_class=c['class'],
                        credits=c['credits'],
                        title='{},{}'.format(c['title_parsed']['zh_TW'], c['title_parsed']['en_US']),
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
