import re

def is_database_modification(query):
    """
    Detects if a SQL query modifies the database.
    
    Args:
        query (str): The SQL query to check.
    
    Returns:
        bool: True if the query modifies the database, False otherwise.
    """
    # Keywords that indicate a database modification operation
    modification_keywords = [
        r'\bINSERT\b',
        r'\bUPDATE\b',
        r'\bDELETE\b',
        r'\bDROP\b',
        r'\bALTER\b',
        r'\bCREATE\b',
        r'\bTRUNCATE\b',
        r'\bRENAME\b',
        r'\bREPLACE\b'
    ]
    
    # Combine keywords into a regex pattern
    pattern = re.compile('|'.join(modification_keywords), re.IGNORECASE)
    
    # Check for any match
    return bool(pattern.search(query))