from django.shortcuts import render_to_response

from django.template import RequestContext

from django.utils import timezone

from django.contrib.auth.decorators import login_required

from .models import Course_of_user, Course

import json


def course_zh_TW(request):
    user = {
        'major': '資工系',
        'grade': 1,
        'm_career': '學士',
        'email': 'cjhwong@gmail.com',
    }  # speed up development with a fake user

    userDept_from_request = user['major']
    userGrade_from_request = user['grade']
    userDegree_from_request = user['m_career']
    email = user['email']
    CourseUser, created = Course_of_user.objects.get_or_create(user_name=user['email'], defaults={
        'hadSaved': False,
        'user_dept': userDept_from_request,
        'user_grade': userGrade_from_request,
        'create': timezone.localtime(timezone.now())
    }
    )
    ##########################################
    #  hadSaved可以知道使用者是不是已經存過課程了 #
    ##########################################
    hadSaved_from_request = CourseUser.hadSaved
    if request.POST:
        # all element of QuerySet is type of list, i dont know why but turn it
        # into diction can disassembler its list into its origin type.
        data = request.POST
        data = data.dict()  # turn Querydict into python's dict
        idList = json.loads(data['idList'])
        save_idList_for_user(idList, data, CourseUser)
        return render_to_response('course/index.html', locals())
    elif 'name' in request.GET and request.GET['name'] != '':
        # CourseUser = Course_of_user.objects.get(user_name=request.GET['name'])
        user_name = CourseUser.user_name
        user_dept = CourseUser.user_dept
        returnarr = CourseUser.returnarr
        time_table = CourseUser.time_table
        booklist = CourseUser.idList.all()
        return render_to_response('course/index.html', locals())
    else:
        test = [12, 23, 45, 6]
        return render_to_response('course/index.html', RequestContext(request, locals()))


def save_idList_for_user(idList, data, CourseUser):
    # Build default dict, if find data already exitst, than update the info.
    default = {
        'time_table': data['time_table'],
        'returnarr': data['returnarr'],
        'hadSaved': True,
        'create': timezone.localtime(timezone.now())
    }
    # u, created = Course_of_user.objects.update_or_create(user_name = data['user_name'], defaults=default)
    # update_or_create will update exist data or create a new one if not.
    Course_of_user.objects.filter(pk=CourseUser.pk).update(**default)
    CourseUser.idList.clear()  # Remove all ManytoMany Relation.
    for i in idList.keys():
        c, created = Course.objects.update_or_create(courseID=i, defaults={
                                                     'courseID': i, 'name': idList[i], 'create': timezone.localtime(timezone.now())})
        # obj is an instance of Model Course! Course_of_User has a manyToMany
        # key of Course
        CourseUser.idList.add(c)
