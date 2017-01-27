from django.http import JsonResponse
from timetable.models import Department


def build_department(school: str):
    Department.objects.all().delete()

    from cal import settings
    import json
    deptList = []
    with open(settings.STATICFILES_DIRS[0] + '/timetable/json/{}/Department.json'.format(school), 'r') as f:
        data = json.load(f)

        for dept_by_degree in data:
            for dept in dept_by_degree["department"]:
                print(dept_by_degree["degree"], dept[
                      "zh_TW"], dept["en_US"], dept["value"])
                deptList.append(
                    Department(
                        school=school,
                        degree=dept_by_degree["degree"],
                        code=dept["value"],
                        title="{},{}".format(dept["zh_TW"], dept["en_US"])
                    )
                )

        Department.objects.bulk_create(deptList)
        return JsonResponse({"state": "ok"})