import os
import importlib
import traceback
from fastapi import FastAPI

def include_routers(app: FastAPI):
    # path to routers directory
    # assumes this file is in backend/ directory
    routers_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "routers")
    
    # Iterate over files
    for filename in os.listdir(routers_dir):
        if filename.endswith(".py") and filename != "__init__.py":
            module_name = filename[:-3] # remove .py
            
            try:
                # Import module
                # We use absolute import with "backend" package
                module = importlib.import_module(f"backend.routers.{module_name}")
                
                # Check for router object
                if hasattr(module, "router"):
                    # Tag with proper case (Capitalize)
                    tag = module_name.capitalize()
                    app.include_router(module.router, tags=[tag])
                    print(f"Included router: {module_name} with tag {tag}")
            except Exception as e:
                print(f"Failed to load router {module_name}: {e}")
                traceback.print_exc()
