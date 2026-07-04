"""Buiry — Universal data ownership for AI applications.

One SDK. Zero config. Full ownership.

Usage:
    from buiry import Buiry
    buiry = Buiry(api_key="sk-...")
    wrapped = buiry.wrap(my_client)
"""

from buiry.buiry import Buiry

__version__ = "0.1.0"
__all__ = ["Buiry"]
