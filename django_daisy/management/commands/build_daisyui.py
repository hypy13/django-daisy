import os
import subprocess

from django.conf import settings  # Import settings to get project root
from django.core.management.base import BaseCommand

__all__ = ["Command", ]


class Command(BaseCommand):
    help = 'Sets the project root directory in an environment variable and runs "npm run watch"'

    def handle(self, *args, **kwargs):
        # Get the project root directory from Django settings
        project_root = str(settings.BASE_DIR)

        # Get the module directory
        django_daisy_dir_path = os.path.abspath(__file__).replace(
            'django_daisy/management/commands/build_daisyui.py', ''
        )

        # Set the project root as an environment variable
        os.environ['DJANGO_ROOT_PROJECT_PATH'] = project_root

        os.chdir(django_daisy_dir_path)

        # Check if npm is installed
        if not self.is_npm_installed():
            self.stdout.write(self.style.WARNING("npm is not installed. Please install npm on your system."))

        # Check if npm packages are installed
        if not self.are_npm_packages_installed(django_daisy_dir_path):
            self.stdout.write(self.style.WARNING("npm packages are not installed. Installing packages..."))
            if not self.install_npm_packages():
                self.stderr.write(self.style.ERROR("Failed to install npm packages."))
                return
            self.stdout.write(self.style.SUCCESS("npm packages installed successfully."))

        try:
            # Run the npm command

            self.stdout.write(self.style.SUCCESS('Running "npm run watch"...'))

            subprocess.run(["npm", "run", "watch"], check=True)

        except subprocess.CalledProcessError as e:
            self.stderr.write(self.style.ERROR(f"Error running npm command: {e}"))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"An error occurred: {e}"))

    def is_npm_installed(self):
        """
        Check if npm is installed by running "npm --version" and catching any errors.
        Returns True if npm is installed, False otherwise.
        """
        try:
            subprocess.run(["npm", "--version"], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False

    def are_npm_packages_installed(self, package_path):
        """
        Check if npm packages are installed by verifying the presence of node_modules directory.
        Returns True if packages are installed, False otherwise.
        """
        node_modules_path = os.path.join(package_path, '../node_modules')
        return os.path.exists(node_modules_path)

    def install_npm_packages(self):
        """
        Run "npm install" to install npm packages from package.json.
        Returns True if the packages were installed successfully, False otherwise.
        """
        try:
            subprocess.run(["npm", "install"], check=True)
            return True
        except subprocess.CalledProcessError as e:
            self.stderr.write(self.style.ERROR(f"Failed to install npm packages: {e}"))
            return False
