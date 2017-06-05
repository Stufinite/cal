from django.http import JsonResponse, HttpResponseRedirect, Http404, HttpResponse

import requests

def user_verify(v_id, v_key):
    r = requests.get('http://' + 'test.localhost.' + 'login.campass.com.tw' + '/fb/user/verify/' + v_id + '/' + v_key)
    if r.text == 'Ok':
        return True
    return False

def user_edit(request):
    if request.method == 'POST':
        v_id = request.POST.get('id')
        v_key = request.POST.get('key')

        if user_verify(v_id, v_key):
            school = request.POST.get('school')
            career = request.POST.get('career')
            major = request.POST.get('major')
            grade = request.POST.get('grade')
            r = requests.get('http://test.localhost.login.campass.com.tw/fb/user/edit/{}/{}/{}/{}/{}'.format(v_id, school, career, major, grade))
            return HttpResponse(r.text)
    raise Http404("Page does not exist")
