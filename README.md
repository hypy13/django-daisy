Django Daisy

demo: http://hy3.ir/admin/
<br>
username: demo
<br>
password: demo

Django Daisy is a modern, lightweight, and responsive admin dashboard built with DaisyUI and TailwindCSS. It offers RTL
support, multiple themes, and an optimized user experience for mobile, tablet, and PC users.
Features

Responsive Design: Adapts seamlessly to different screen sizes.
RTL Support: Ensures proper layout for right-to-left languages.
Multi-theme Support: Easily switch between themes.
Enhanced UX/UI: Improved admin interface with tabbed inline admins and sidebar icons.
Admin List Filter: Supports multi-value filtering for easier navigation.

Compatibility

    Supports Django 3.2 - 5.1.1.

Upcoming Features

    Continuous improvements and new features added regularly.

Installation

    pip install django-daisy

or as editable github source:

    pip install -e git+https://github.com/hypy13/django-daisy.git#egg=django-daisy

Add django_daisy to your INSTALLED_APPS in the Django settings file.
and comment the default django admin 'django.contrib.admin' app

    INSTALLED_APPS = [
        'django_daisy',
        # 'django.contrib.admin',
        ...
    ]

Enjoy the new theme!

Contributing

Contributions are welcome! Feel free to submit issues or pull requests for improvements.
License

This project is open-source and free to use under the Apache 2.0 License.
