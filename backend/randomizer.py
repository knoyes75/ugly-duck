import random

BUSINESS_TYPES = [
    "restaurant", "plumber", "electrician", "landscaping", "auto repair",
    "hair salon", "nail salon", "dentist", "chiropractor", "physical therapist",
    "law firm", "accountant", "real estate agent", "mortgage broker",
    "contractor", "roofing company", "hvac", "pest control", "cleaning service",
    "flooring company", "painting company", "pool service", "tree service",
    "towing company", "locksmith", "appliance repair", "auto body shop",
    "veterinarian", "optometrist", "med spa", "tattoo shop", "gym",
    "martial arts school", "dance studio", "music school", "tutoring center",
    "insurance agency", "financial advisor", "travel agency", "print shop",
    "photography studio", "catering company", "bakery", "food truck",
]

CITIES = [
    # Southeast (SBD)
    "Orlando FL", "Tampa FL", "Jacksonville FL", "Gainesville FL", "Pensacola FL",
    "Tallahassee FL", "Fort Myers FL", "Sarasota FL", "Daytona Beach FL",
    "Atlanta GA", "Savannah GA", "Augusta GA", "Macon GA", "Columbus GA",
    "Charleston SC", "Columbia SC", "Greenville SC", "Myrtle Beach SC",
    "Little Rock AR", "Fayetteville AR", "Fort Smith AR", "Jonesboro AR",
    "Birmingham AL", "Huntsville AL", "Montgomery AL", "Mobile AL", "Tuscaloosa AL",
    # New England (SBW)
    "Portland ME", "Bangor ME", "Augusta ME", "Lewiston ME",
    "Manchester NH", "Concord NH", "Nashua NH", "Portsmouth NH",
    "Burlington VT", "Montpelier VT", "Rutland VT",
    "Boston MA", "Worcester MA", "Springfield MA", "Lowell MA", "New Bedford MA",
    # Other underserved markets
    "Boise ID", "Spokane WA", "Billings MT", "Cheyenne WY", "Rapid City SD",
    "Sioux Falls SD", "Fargo ND", "Bismarck ND", "Missoula MT", "Pocatello ID",
    "Shreveport LA", "Lafayette LA", "Baton Rouge LA", "Biloxi MS", "Jackson MS",
    "Knoxville TN", "Chattanooga TN", "Memphis TN", "Lexington KY", "Bowling Green KY",
    "Roanoke VA", "Lynchburg VA", "Charlottesville VA", "Wilmington NC", "Asheville NC",
]


def get_random() -> dict:
    return {
        "business_type": random.choice(BUSINESS_TYPES),
        "city": random.choice(CITIES),
    }
