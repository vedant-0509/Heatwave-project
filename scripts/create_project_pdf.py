import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def generate_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        rightMargin=40, leftMargin=40,
        topMargin=40, bottomMargin=40
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    PRIMARY = colors.HexColor('#0f172a')     # Dark Slate
    SECONDARY = colors.HexColor('#e11d48')   # Rose / Thermal Red
    ACCENT = colors.HexColor('#0284c7')      # Sky Blue
    BG_LIGHT = colors.HexColor('#f8fafc')    # Off white
    CARD_BG = colors.HexColor('#f1f5f9')     # Light slate
    TEXT_DARK = colors.HexColor('#1e293b')   # Slate 800
    MUTED = colors.HexColor('#64748b')       # Slate 500

    # Custom Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=SECONDARY,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=6
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=ACCENT,
        spaceBefore=10,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=TEXT_DARK,
        spaceAfter=8
    )

    bold_body_style = ParagraphStyle(
        'BoldBody_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=TEXT_DARK,
        spaceAfter=8
    )

    callout_style = ParagraphStyle(
        'Callout_Text',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=0
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=colors.white,
        alignment=1 # Center
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=TEXT_DARK
    )

    story = []

    # Title Banner
    story.append(Paragraph("UrbanHeat — Simple Project Guide & Reference", title_style))
    story.append(Paragraph("Everything Explained From Scratch (For Students, Professors & Viva Preparation)", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=SECONDARY, spaceBefore=0, spaceAfter=12))

    # SECTION 1: WHAT IS THIS PROJECT?
    story.append(Paragraph("1. What Is This Project All About? (The Simple Analogy)", h1_style))
    story.append(Paragraph(
        "Imagine a giant city like <b>Mumbai</b> during summer. Standard weather apps (like Google Weather or iPhone Weather) show just <b>one single temperature for the entire city</b> (e.g. <i>'Mumbai is 33°C'</i>).", body_style
    ))
    story.append(Paragraph(
        "But anyone living in Mumbai knows that is not true! If you stand under a big green tree in <b>Sanjay Gandhi National Park or Malabar Hill</b>, it feels pleasant. But if you stand in <b>Dharavi, Kurla, or Dongri</b> surrounded by concrete walls, metal tin roofs, and asphalt roads, it feels like an oven!", body_style
    ))

    # Callout Box
    callout_data = [[
        Paragraph("<b>Core Problem We Solve:</b> Standard weather apps treat the whole city as one block. Our project, <b>UrbanHeat</b>, acts like a <i>microscope for heat</i>. It breaks Mumbai down into <b>24 municipal neighborhoods (Wards)</b> to show exactly where it is boiling hot and where it is cool.", callout_style)
    ]]
    callout_table = Table(callout_data, colWidths=[520])
    callout_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CARD_BG),
        ('BOX', (0,0), (-1,-1), 1, ACCENT),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(callout_table)
    story.append(Spacer(1, 10))

    # SECTION 2: DATASETS WE TOOK
    story.append(Paragraph("2. Which Datasets Did We Take? (Where Did Data Come From?)", h1_style))
    story.append(Paragraph(
        "To build this website, we collected 3 main types of data:", body_style
    ))

    dataset_table_data = [
        [Paragraph("Dataset Name", table_header_style), Paragraph("Where It Came From", table_header_style), Paragraph("What Information It Gives Us", table_header_style)],
        [
            Paragraph("<b>1. MCGM 24 Ward Boundaries GeoJSON</b>", table_cell_style),
            Paragraph("Public GIS Spatial Datasets (DataMeet / MCGM BMC)", table_cell_style),
            Paragraph("The exact latitude/longitude boundary shapes for all 24 Mumbai administrative wards (from Colaba in South Mumbai to Dahisar/Mulund in North).", table_cell_style)
        ],
        [
            Paragraph("<b>2. Satellite Thermal & Infrared Data</b>", table_cell_style),
            Paragraph("USGS Landsat-9 Satellite & Sentinel-2 Satellites", table_cell_style),
            Paragraph("Thermal sensors in space measure the <b>ground skin temperature</b> of roofs and roads, and optical cameras measure how green (plants) or concrete an area is.", table_cell_style)
        ],
        [
            Paragraph("<b>3. Real-Time Live Weather API</b>", table_cell_style),
            Paragraph("Open-Meteo REST Meteorological API", table_cell_style),
            Paragraph("Live hourly air temperature, humidity %, wind speed, solar radiation (W/m²), and ground soil temperature directly over the internet.", table_cell_style)
        ]
    ]
    ds_table = Table(dataset_table_data, colWidths=[130, 150, 240])
    ds_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT])
    ]))
    story.append(ds_table)
    story.append(Spacer(1, 12))

    # SECTION 3: KEY TERMS USED TO CALCULATE HEAT
    story.append(Paragraph("3. All Terms Required to Calculate Heat (Explained Simply)", h1_style))
    story.append(Paragraph(
        "Here are the 7 core terms you need to know to answer any question:", body_style
    ))

    terms = [
        ("Air Temperature (T_air)", "The regular temperature of the air around you (measured 2 meters high in the shade). Example: 33°C."),
        ("Land Surface Temperature (LST)", "The radiative <i>skin temperature</i> of actual roads, concrete roofs, and soil! On a sunny afternoon, dark asphalt roads reach <b>45°C - 50°C</b> even when air temp is 33°C!"),
        ("Relative Humidity (%)", "The percentage of water vapor floating in the air. High humidity stops human sweat from evaporating, making heat feel unbearable."),
        ("Heat Index (HI)", "The <b>'Real-Feel' temperature</b> combining Air Temp + Humidity. In coastal Mumbai, 34°C air + 75% humidity feels like <b>42°C</b> to the human body!"),
        ("NDVI (Green Plant Index)", "Score from -1 to +1 showing how many trees and plants exist. High NDVI (>0.35) = Lots of green trees that shade and cool the neighborhood."),
        ("NDBI (Concrete/Building Index)", "Score from -1 to +1 showing how much concrete, asphalt, and building roofs exist. High NDBI (>0.65) = Dense concrete trapping heat."),
        ("HVI (Heat Vulnerability Index)", "Our total combined risk score (0 to 100). Higher score = Higher danger of heat stress for citizens in that ward!")
    ]

    for term_title, term_desc in terms:
        story.append(Paragraph(f"• <b>{term_title}</b>: {term_desc}", body_style))

    story.append(Spacer(1, 10))

    # SECTION 4: WHAT IS K-MEANS & HOW IS IT USED?
    story.append(Paragraph("4. What Is K-Means Machine Learning & How Is It Used on Our Website?", h1_style))
    story.append(Paragraph(
        "<b>What is K-Means? (Explained Like You're 10 Years Old):</b>", bold_body_style
    ))
    story.append(Paragraph(
        "Imagine you have a box of 24 different colored toys. You want to sort them into <b>3 groups</b> based on their color and size, but you don't know the names of the groups yet.<br/>"
        "<b>K-Means</b> is a smart computer sorting algorithm (unsupervised machine learning). The <b>'K'</b> stands for the number of groups you want (we chose <b>K = 3</b>). The computer looks at all 24 Mumbai wards without any human bias, compares their ground temp (LST), concrete level (NDBI), greenery (NDVI), and population, and automatically groups them into 3 distinct microclimate types!", body_style
    ))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>The 3 Microclimate Groups (Clusters) Created by K-Means:</b>", bold_body_style))

    cluster_table_data = [
        [Paragraph("Cluster Group", table_header_style), Paragraph("Archetype Name", table_header_style), Paragraph("Characteristics & Examples in Mumbai", table_header_style)],
        [
            Paragraph("<b>Cluster 0</b> (Red)", table_cell_style),
            Paragraph("<b>Concrete Thermal Hotspot</b>", table_cell_style),
            Paragraph("High surface temperature (>37°C), dense concrete roofs (NDBI > 0.68), almost no trees, high population density. <i>Examples: Dharavi, Kurla, Dongri.</i>", table_cell_style)
        ],
        [
            Paragraph("<b>Cluster 1</b> (Green)", table_cell_style),
            Paragraph("<b>Vegetated Thermal Buffer</b>", table_cell_style),
            Paragraph("Cooler surface temperature (<33.5°C), high tree canopy cover (NDVI > 0.35). <i>Examples: Sanjay Gandhi National Park, Powai, Malabar Hill.</i>", table_cell_style)
        ],
        [
            Paragraph("<b>Cluster 2</b> (Blue)", table_cell_style),
            Paragraph("<b>Coastal Moderate Microclimate</b>", table_cell_style),
            Paragraph("Moderated by cool ocean sea breezes, moderate built density. <i>Examples: Colaba, Bandra West, Versova.</i>", table_cell_style)
        ]
    ]
    cl_table = Table(cluster_table_data, colWidths=[90, 150, 280])
    cl_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT])
    ]))
    story.append(cl_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>How K-Means is Used in Our Website:</b>", bold_body_style))
    story.append(Paragraph(
        "1. Our Python backend runs the <b>scikit-learn K-Means algorithm</b> on the dataset when the server starts.<br/>"
        "2. Each of the 24 wards gets assigned a Cluster ID (0, 1, or 2).<br/>"
        "3. On the interactive map on our website, when a user selects the <b>'Microclimate Cluster'</b> layer, the map automatically colors Cluster 0 Red, Cluster 1 Green, and Cluster 2 Blue!", body_style
    ))

    story.append(Spacer(1, 10))

    # SECTION 5: WHAT-IF SIMULATION ENGINE
    story.append(Paragraph("5. What-If Urban Cooling Simulator (Interactive Feature)", h1_style))
    story.append(Paragraph(
        "We built an interactive slider tool on our website where urban planners or students can test cooling solutions:<br/>"
        "• <i>'What if we plant 20% more green trees (Increase NDVI) in Dharavi?'</i><br/>"
        "• <i>'What if we paint metal roofs white to reflect heat (Decrease NDBI)?'</i><br/>"
        "Our mathematical model (Ridge Regression) instantly calculates: <b>'Surface temp will drop by 2.3°C and risk score will drop by 12 points!'</b>", body_style
    ))

    story.append(Spacer(1, 10))

    # SECTION 6: HOW EVERYTHING IS INTEGRATED
    story.append(Paragraph("6. How Everything Is Connected (Step-by-Step Architecture)", h1_style))
    story.append(Paragraph(
        "1. <b>Frontend (Website UI)</b>: Built using <b>React 19 + TypeScript + MapLibre GL JS</b>. It renders the interactive map, search bar, legend, and charts.<br/>"
        "2. <b>Backend (Python FastAPI)</b>: Runs behind the scenes on port <code>8000</code>. It queries Open-Meteo live weather servers, disaggregates temperature per ward, runs the K-Means algorithm, and sends clean JSON data to the website.<br/>"
        "3. <b>Search & Auto-Zoom</b>: When a user searches <i>'Dharavi'</i> or <i>'Bandra'</i>, the map smoothly flies and zooms straight into that ward, highlighting its boundary and thermal sampling dots!", body_style
    ))

    story.append(Spacer(1, 14))

    # VIVA QUICK REFERENCE BOX
    viva_box_data = [[
        Paragraph("<b>30-Second Viva Answer for Professors:</b><br/>"
                  "<i>'Sir/Ma'am, UrbanHeat disaggregates Mumbai's weather into 24 wards using Landsat-9 surface skin temp (LST) and Open-Meteo real-time atmospheric data. We use <b>Unsupervised K-Means Clustering (K=3)</b> to group wards into Concrete Hotspots, Vegetated Buffers, and Coastal Zones, and an <b>Empirical Ridge Regression model</b> to simulate temperature reduction when tree canopy or cool roofs are added.'</i>", callout_style)
    ]]
    viva_table = Table(viva_box_data, colWidths=[520])
    viva_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#eff6ff')),
        ('BOX', (0,0), (-1,-1), 1.5, SECONDARY),
        ('PADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(viva_table)

    doc.build(story)
    print(f"Generated {filename} successfully!")

if __name__ == "__main__":
    output_path = r"c:\Users\Unnati\OneDrive\Desktop\Urban_heat_wave\UrbanHeat_Project_Explanation.pdf"
    generate_pdf(output_path)
