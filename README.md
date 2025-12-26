# Django Daisy v2.0 🌼

![Test Status](https://github.com/hypy13/django-daisy/actions/workflows/tox_test.yml/badge.svg)
[![Published on Django Packages](https://img.shields.io/badge/Published%20on-Django%20Packages-0c3c26)](https://djangopackages.org/packages/p/django-daisy/)
![PyPI Downloads](https://badgen.net/pypi/dm/django-daisy)

**🎉 NEW: Version 2.0 is here!** Built with DaisyUI v5 and Tailwind CSS v4 for blazing-fast performance, enhanced responsiveness, and stunning new designs.

---

## 🚀 Live Demo

[**Try it now: https://hypy13-django-daisy.hf.space/en/admin/**](https://hypy13-django-daisy.hf.space/en/admin/)  
**Username:** demo | **Password:** demo

**RTL Demo:** https://hypy13-django-daisy.hf.space/fa/admin/

![ScreenShot](https://raw.githubusercontent.com/hypy13/django-daisy/refs/heads/main/screenshots/change_form.png)

---

## 📖 Documentation

**Full documentation:** https://hypy13.github.io/django-daisy-docs/

---

## ✨ What's New in v2.0

Version 2.0 brings major improvements in performance, design, and user experience:

- ⚡ **DaisyUI v5 & Tailwind CSS v4** - Lighter, faster, and more efficient
- 🎨 **New Themes & Icons** - Expanded theme collection with modern iconography
- 📱 **Enhanced Responsiveness** - Improved mobile experience with compact table views
- 🎯 **Redesigned Change Form** - Submit buttons relocated to right sidebar on large screens
- 📜 **Recent History Component** - Quick access to recent object changes in the sidebar
- 🗑️ **Improved Delete Confirmation** - Cleaner, more intuitive deletion interface
- ✅ **Updated Form Controls** - Modern DaisyUI v5 checkbox and input styling
- 🔧 **Performance Optimizations** - Faster load times and smoother interactions

<details>
<summary><strong>📋 Complete Changelog</strong></summary>

1. Upgraded to DaisyUI v5 and Tailwind CSS v4
2. Relocated submit button row to right sidebar on large screens (change form)
3. Added recent object history component in right sidebar (change form)
4. Improved change list table responsiveness with compact mobile view
5. Enhanced delete confirmation page design
6. Updated checkbox inputs to DaisyUI v5 styling
7. Added new themes to theme selector with updated icons
8. Various responsive improvements and UI enhancements

</details>

---

## ✨ Core Features

- 🌍 **Fully Responsive** - Seamless experience across mobile, tablet, and desktop
- 🔄 **RTL Support** - Complete right-to-left language support
- 🎨 **Multi-Theme System** - Switch themes effortlessly to match your brand
- 📑 **Tabbed Inline Admin** - Organize related data with tabbed sections
- 🔍 **Advanced Filtering** - Multi-value filters for precise navigation
- 🚀 **Optimized Performance** - Lightning-fast load times with minimal overhead

---

## ⚙️ Compatibility

- **Django:** 3.2 - 5.1.1 fully supported
- **Python:** 3.8+

---

## 📦 Installation

### Quick Install (PyPI)

```bash
pip install django-daisy
```

### Development Install (GitHub)

```bash
pip install -e git+https://github.com/hypy13/django-daisy.git#egg=django-daisy
```

### Configuration

Add to your `INSTALLED_APPS` in `settings.py`:

```python
INSTALLED_APPS = [
    'django_daisy',
    'django.contrib.admin',
    'django.contrib.humanize',  # Required
    # ... your other apps
]
```

That's it! Your admin now has a modern, beautiful interface.

---

## 🎨 Customization

<details>
<summary><strong>App Configuration (apps.py)</strong></summary>

Customize individual app appearance in the sidebar:

```python
class PollsConfig(AppConfig):
    name = 'polls'
    icon = 'fa fa-square-poll-vertical'  # FontAwesome icon
    divider_title = "Apps"  # Section divider title
    priority = 0  # Sidebar ordering (higher = top)
    hide = False  # Hide from sidebar
```

</details>

<details>
<summary><strong>Global Settings (settings.py)</strong></summary>

Configure site-wide appearance and behavior:

```python
DAISY_SETTINGS = {
    # Branding
    'SITE_TITLE': 'Django Admin',
    'SITE_HEADER': 'Administration',
    'INDEX_TITLE': 'Hi, welcome to your dashboard',
    'SITE_LOGO': '/static/admin/img/daisyui-logomark.svg',
    
    # Customization
    'EXTRA_STYLES': [],  # Additional CSS files
    'EXTRA_SCRIPTS': [],  # Additional JS files
    'LOAD_FULL_STYLES': False,  # Load complete DaisyUI library
    'SHOW_CHANGELIST_FILTER': False,  # Auto-open filter sidebar
    'DONT_SUPPORT_ME': False,  # Hide GitHub link
    'SIDEBAR_FOOTNOTE': '',  # Custom sidebar footer text
    
    # Theme Configuration
    'DEFAULT_THEME': None,  # e.g., 'corporate', 'dark'
    'DEFAULT_THEME_DARK': None,  # Dark mode default
    'SHOW_THEME_SELECTOR': True,  # Show/hide theme dropdown
    'THEME_LIST': [
        {'name': 'Light', 'value': 'light'},
        {'name': 'Dark', 'value': 'dark'},
        # Add custom themes...
    ],
    
    # Third-Party App Customization
    'APPS_REORDER': {
        'auth': {
            'icon': 'fa-solid fa-person-military-pointing',
            'name': 'Authentication',
            'hide': False,
            'divider_title': "Auth",
        },
    },
}
```

</details>

<details>
<summary><strong>Theme Configuration Examples</strong></summary>

**Single Default Theme:**
```python
DAISY_SETTINGS = {
    'DEFAULT_THEME': 'corporate',  # Always use this theme
}
```

**Separate Light/Dark Themes:**
```python
DAISY_SETTINGS = {
    'DEFAULT_THEME': 'light',      # Light mode default
    'DEFAULT_THEME_DARK': 'dim',   # Dark mode default
}
```

**Enforce Theme (No User Choice):**
```python
DAISY_SETTINGS = {
    'DEFAULT_THEME': 'corporate',
    'SHOW_THEME_SELECTOR': False,  # Hide selector
}
```

**Custom Theme List:**
```python
DAISY_SETTINGS = {
    'THEME_LIST': [
        {'name': 'Light', 'value': 'light'},
        {'name': 'Corporate', 'value': 'corporate'},
        {'name': 'Luxury', 'value': 'luxury'},
    ],
}
```

> **Note:** For custom DaisyUI themes, enable `LOAD_FULL_STYLES: True` to load all theme styles.

</details>

---

## 🔧 Advanced Features

<details>
<summary><strong>Tabbed Inline Admin</strong></summary>

Create tabbed inline interfaces for related objects:

```python
from django_daisy.mixins import NavTabMixin

class ChoiceInline(admin.TabularInline, NavTabMixin):
    model = Choice
    extra = 1

@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    inlines = [ChoiceInline]
```

</details>

<details>
<summary><strong>Tabbed Fieldsets</strong></summary>

Convert fieldsets into navigation tabs:

```python
@admin.register(MyModel)
class MyModelAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {
            'fields': ('username', 'password')
        }),
        ('Personal Info', {
            'fields': ('first_name', 'last_name', 'email'),
            'classes': ('navtab',),  # Creates a tab
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser'),
        }),
    )
```

</details>

<details>
<summary><strong>Language Switching</strong></summary>

Enable language selection in the admin panel:

**1. Add URL pattern (`urls.py`):**
```python
urlpatterns = [
    path("i18n/", include("django.conf.urls.i18n")),
    # ... other patterns
]
```

**2. Enable middleware (`settings.py`):**
```python
MIDDLEWARE = [
    'django.middleware.locale.LocaleMiddleware',
    # ... other middleware
]
```

**3. Define languages (`settings.py`):**
```python
LANGUAGES = [
    ('en', 'English'),
    ('fa', 'Farsi'),
    # Add more languages...
]
```

</details>

---

## 📸 Screenshots

<details>
<summary><strong>View Gallery</strong></summary>

**Listing View:**
![Listing View](https://raw.githubusercontent.com/hypy13/django-daisy/refs/heads/main/screenshots/listing.png)

**Change Form:**
![Change Form](https://raw.githubusercontent.com/hypy13/django-daisy/refs/heads/main/screenshots/change_form.png)

**Mobile Responsive:**
![Mobile View](https://raw.githubusercontent.com/hypy13/django-daisy/refs/heads/main/screenshots/mobile.png)

**Dark Theme:**
![Dark Theme](https://raw.githubusercontent.com/hypy13/django-daisy/refs/heads/main/screenshots/dark_theme.png)

</details>

---

## 🤝 Contributing

Contributions are welcome! Submit issues, suggestions, or pull requests on [GitHub](https://github.com/hypy13/django-daisy).

---

## 🙏 Acknowledgments

Special thanks to [Cloud With Django](https://www.youtube.com/@CloudWithDjango) for featuring Django Daisy!  
**Watch the demo:** https://www.youtube.com/watch?v=WEKTXu1la9M

---

## 📄 License

MIT License - see LICENSE file for details

---

**Made with ❤️ by the Django Daisy team**
