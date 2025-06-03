# Django Daisy
![Test Status](https://github.com/hypy13/django-daisy/actions/workflows/tox_test.yml/badge.svg)
[![Published on Django Packages](https://img.shields.io/badge/Published%20on-Django%20Packages-0c3c26)](https://djangopackages.org/packages/p/django-daisy/)


[**Live Demo https://hypy13-django-daisy.hf.space/en/admin/**](https://hypy13-django-daisy.hf.space/en/admin/)  
**Username:** demo  
**Password:** demo


for RTL mode:
https://hypy13-django-daisy.hf.space/fa/admin/

![ScreenShot](https://raw.githubusercontent.com/hypy13/django-daisy/refs/heads/main/screenshots/change_form.png)

---

Django Daisy is a modern, sleek, and highly responsive admin dashboard built with **DaisyUI** and **TailwindCSS**. It brings a polished and user-friendly interface that scales beautifully across devices, from mobile to desktop, making your admin experience fast and efficient.


### Documentation:
https://hypy13.github.io/django-daisy-docs/

---

## ✨ Key Features

- 🌍 **Responsive Design**: Perfectly adapts to all screen sizes, ensuring a seamless user experience across mobile, tablet, and desktop devices.
- 🔄 **RTL Support**: Complete right-to-left language support, with a clean and consistent layout for RTL users.
- 🎨 **Multi-Theme Support**: Effortlessly switch between themes to match your brand identity or personal style.
- 🚀 **Enhanced UX/UI**: Experience an optimized interface with **tabbed inline admin panels** for better organization and usability.
- 📝 **Tabbed Inline Admin**: Manage related data more efficiently with tabbed inline admin sections, improving organization and accessibility.
- 🔍 **Advanced Admin Filtering**: Utilize multi-value filters for fast and precise navigation through admin lists.

---

## ⚙️ Compatibility

- Django 3.2 - 5.1.1 are fully supported.

---

## 🚧 Upcoming Features

Stay tuned! Continuous improvements and new features are regularly added to enhance your experience.

---

## 📦 Installation

### Option 1: Install via PyPi

```bash
pip install django-daisy
```
### Option 2: Install as an editable GitHub source

```bash
pip install -e git+https://github.com/hypy13/django-daisy.git#egg=django-daisy
```

After installation, add `django_daisy` and `django.contrib.humanize` to your `INSTALLED_APPS` in the Django settings file.  

```python
INSTALLED_APPS = [
    'django_daisy',
    'django.contrib.admin',
    'django.contrib.humanize',  # Required for django-daisy
    ...
]
```


Once you've made these changes, enjoy the fresh new theme!

---

## Project Customizations

### 1. App Configuration in `apps.py`

You can configure app-specific settings in the `apps.py` file for each application within your Django project. Below is an example of how to customize the `Polls` app:

```python
class PollsConfig(AppConfig):
    name = 'polls'  # The name of the app
    icon = 'fa fa-square-poll-vertical'  # FontAwesome icon for the app (optional)
    divider_title = "Apps"  # Title of the section divider in the sidebar (optional)
    priority = 0  # Determines the order of the app in the sidebar (higher values appear first, optional)
    hide = False  # Set to True to hide the app from the sidebar menu (optional)
```

### Explanation:
- **name**: The name of the app.
- **icon**: An optional FontAwesome icon to display next to the app name in the sidebar.
- **divider_title**: The title for the section divider, grouping similar apps together (optional).
- **priority**: An optional setting that controls the order of apps in the sidebar; higher values appear at the top.
- **hide**: If set to `True`, the app will be hidden from the sidebar menu.

---

## 2. Global Customizations in `settings.py`

You can define various project-wide settings for customizing the Django admin interface in your `settings.py` file using the `DAISY_SETTINGS` dictionary. Below is an example configuration:

```python
DAISY_SETTINGS = {
    'SITE_TITLE': 'Django Admin',  # The title of the site 
    'SITE_HEADER': 'Administration',  # Header text displayed in the admin panel
    'INDEX_TITLE': 'Hi, welcome to your dashboard',  # The title for the index page of dashboard
    'SITE_LOGO': '/static/admin/img/daisyui-logomark.svg',  # Path to the logo image displayed in the sidebar
    'EXTRA_STYLES': [],  # List of extra stylesheets to be loaded in base.html (optional)
    'EXTRA_SCRIPTS': [],  # List of extra script URLs to be loaded in base.html (optional)
    'LOAD_FULL_STYLES': False,  # If True, loads full DaisyUI components in the admin (useful if you have custom template overrides)
    'SHOW_CHANGELIST_FILTER': False,  # If True, the filter sidebar will open by default on changelist views
    'DONT_SUPPORT_ME': False, # Hide github link in sidebar footer
    'SIDEBAR_FOOTNOTE': '', # add footnote to sidebar
    'APPS_REORDER': {
        # Custom configurations for third-party apps that can't be modified directly in their `apps.py`
        'auth': {
            'icon': 'fa-solid fa-person-military-pointing',  # FontAwesome icon for the 'auth' app
            'name': 'Authentication',  # Custom name for the 'auth' app
            'hide': False,  # Whether to hide the 'auth' app from the sidebar (set to True to hide)
            'divider_title': "Auth",  # Divider title for the 'auth' section
        },
        'social_django': {
            'icon': 'fa-solid fa-users-gear',  # Custom FontAwesome icon for the 'social_django' app
        },
    },
}
```

### Explanation:
- **SITE_TITLE**: Sets the title of your site (visible in the browser tab).
- **SITE_HEADER**: The header displayed at the top of the Django admin interface.
- **INDEX_TITLE**: The title shown on the dashboard page of the admin panel.
- **SITE_LOGO**: Specifies the path to a logo image that appears in the sidebar.
- **EXTRA_STYLES**: A list of additional CSS files to be loaded into the admin interface (useful for custom styling).
- **EXTRA_SCRIPTS**: A list of additional JavaScript files to be loaded into the admin interface.
- **LOAD_FULL_STYLES**: If set to `True`, loads the full DaisyUI library for styling, which can be useful if you have overridden the admin templates.
- **SHOW_CHANGELIST_FILTER**: Controls whether the changelist filter sidebar is shown by default.
- **DONT_SUPPORT_ME**: Hide github link in sidebar footer.
- **SIDEBAR_FOOTNOTE**: Add footnote to sidebar.
- **APPS_REORDER**: This allows you to reorder, customize, and modify third-party apps. For example, you can change the name of the `auth` app to `users`, provide a custom icon, or hide it from the sidebar entirely.

---

### Using Tabbed Inline Admin

To create a tabbed inline admin interface in your Django project, follow these steps:

1. **Import the necessary modules**:
    import NavTabMixin in your `admin.py` file:
   ```python
   from django_daisy.mixins import NavTabMixin
   ```

2. **Extend `NavTabMixin` in your `InlineAdmin` class**:
   Create your inline admin class by extending `NavTabMixin` along with `admin.TabularInline` or `admin.StackedInline` for a different layout:
   ```python
   class ChoiceInline(admin.TabularInline, NavTabMixin):  # or admin.StackedInline for a different layout
       model = Choice
       extra = 1
   ```

3. **Register your inline admin class**:
   Use the inline admin class in your `ModelAdmin` class:
   ```python
   @admin.register(Poll)
   class PollAdmin(admin.ModelAdmin):
       inlines = [ChoiceInline]
   ```

### 🌐 Enabling Language Change in Admin Panel

To enable language switching directly from the admin panel, follow these steps:

1. **Include Django's `set_language` URL**  
   Add the following line to your `urls.py` file:
   ```python
   urlpatterns = [
       ...,
       path("i18n/", include("django.conf.urls.i18n")),  # Add this line
   ]
   ```

2. **Ensure `LocaleMiddleware` is Enabled**  
   Confirm that the following middleware is included in your `MIDDLEWARE` settings:
   ```python
   MIDDLEWARE = [
       ...,
       'django.middleware.locale.LocaleMiddleware',
       ...
   ]
   ```

3. **Define Supported Language**   
   Specify the languages your application supports in `settings.py`:
   ```python
   LANGUAGES = [
       ('en', 'English'),
       ('fa', 'Farsi'),
       # Add other languages as needed
   ]
   ```

## 🤝 Contributing

We welcome contributions from the community! Feel free to submit any issues, suggestions, or pull requests to help improve Django Daisy.

---

## 📸 Screenshots

##### Listing View:
![Listing View](https://raw.githubusercontent.com/hypy13/django-daisy/refs/heads/main/screenshots/listing.png)

##### Change Form:
![Listing View](https://raw.githubusercontent.com/hypy13/django-daisy/refs/heads/main/screenshots/change_form.png)

##### Mobile Responsive:
![Listing View](https://raw.githubusercontent.com/hypy13/django-daisy/refs/heads/main/screenshots/mobile.png)

##### Dark Theme:
![Listing View](https://raw.githubusercontent.com/hypy13/django-daisy/refs/heads/main/screenshots/dark_theme.png)

## Acknowledgments
Special thanks to [Cloud With Django](https://www.youtube.com/@CloudWithDjango) for featuring my theme in their video. Your support means a lot! <br>
Demo Video: https://www.youtube.com/watch?v=WEKTXu1la9M


