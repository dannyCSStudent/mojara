import os
from dotenv import load_dotenv
load_dotenv()


from app.repositories.user import promote_to_admin

USER_ID = "f29f0b08-0112-49a9-b963-924f31cb241d"

result = promote_to_admin(USER_ID)
print(result)
