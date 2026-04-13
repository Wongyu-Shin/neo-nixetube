"""
Central parametric dimensions for 경로 2 (room-temp butyl-sealed) Nixie tube.
All units are millimeters unless noted. Keep this file as the single source of
truth — every part module should import from here, never hard-code numbers.

Origin convention: XY plane at tube base center, Z axis along tube length (up).
"""

# --- Glass envelope (COTS borosilicate tube) ---
# Nominal spec approximating "Pyrex 25x1.5x60" SKUs from 과학기자재 vendors.
ENVELOPE_OD = 25.0              # outer diameter (mm)
ENVELOPE_WALL = 1.5             # wall thickness (mm)
ENVELOPE_ID = ENVELOPE_OD - 2 * ENVELOPE_WALL  # 22.0 mm
ENVELOPE_LENGTH = 60.0          # overall glass length (mm)

# --- End caps (machined aluminum, top and bottom) ---
END_CAP_OD = ENVELOPE_OD        # flush with envelope OD
END_CAP_THICKNESS = 5.0         # axial thickness (mm)
END_CAP_GROOVE_WIDTH = 2.0      # butyl bead channel axial width (on lip OD)
END_CAP_GROOVE_DEPTH = 0.8      # radial depth of butyl bead pocket
END_CAP_LIP_HEIGHT = 4.0        # lip that enters the glass ID

# Realistic borosilicate tube ID tolerance is ±0.3 mm per Schott DURAN 7740.
# Lip OD must be undersized by more than that to guarantee slip-fit in the
# worst-case ID. Design to the smallest expected ID:
GLASS_ID_TOL = 0.3              # mm ±
LIP_OD_CLEARANCE = GLASS_ID_TOL + 0.3  # 0.6 mm diametral clearance worst-case

# --- Sight glass / viewing aperture (on top cap) ---
# Top cap has a central cylindrical bore so the cathode stack is visible
# from the +Z axis. A sapphire or borosilicate disk is bonded into the bore
# with Torr Seal vacuum epoxy (Varian/Agilent), which is a proven UHV-grade
# sealant rated to <10⁻⁹ Torr·L/s leak rate. Sol-gel SiO₂ at 10 µm was
# insufficient as a sole hermetic barrier — Torr Seal provides the structural
# vacuum bond while sol-gel can optionally overcoat for optical clarity.
SIGHT_GLASS_OD = 16.0           # 16 mm window — covers the 10×15 digit frame
SIGHT_GLASS_THICKNESS = 1.5     # Schott B270 or sapphire window stock
SIGHT_GLASS_SEAL = "butyl + Torr Seal"  # composite: butyl cushion + Torr Seal barrier

# --- Fill port / tip-off stem (on bottom cap) ---
# 1/16" (1.5875 mm) OD soft copper capillary tube. Smaller than the 1/8"
# originally planned — necessary because the safe annular band for the fill
# hole between the feedthrough pocket (r=6.4) and butyl groove (r=9.9) is
# only 3.5 mm wide; a 1/8" stem leaves only 0.06 mm walls, below CNC
# tolerance. With 1/16" OD, walls are ≥0.85 mm on each side. Crimped shut
# with a jeweler's crimp tool after Ne flushing. Standard capillary stock
# (ASTM B75 / Cu C12200).
FILL_STEM_OD = 1.5875           # 1/16" Cu capillary
FILL_STEM_ID = 0.8              # 0.394 mm wall (standard gauge)
FILL_STEM_LENGTH = 10.0         # protruding length before crimp
FILL_STEM_SEAL = "Torr Seal"   # UHV epoxy around Cu tube-to-Al hole annular gap

# --- Hermetic feedthrough (12-pin glass-to-metal header, custom) ---
# 12-pin Kovar/glass-bead compression header. Standard JEDEC TO-8 has only
# 8 leads — insufficient for 10 cathode + anode + spare. This design
# requires a custom 12-pin header from a hermetic seal vendor:
#   Procurement: Schott Electronic Packaging (Eternaloc line), or
#   NTK/Kyocera (custom ceramic headers), or eBay surplus 12-pin headers.
#   Lead time: 6-12 weeks for custom; immediate for surplus.
#   Type: CUSTOM (not off-the-shelf COTS — explicitly labeled as such).
FT_BODY_OD = 12.7               # 12-pin compression header body OD
FT_BODY_FLANGE = 1.2            # flange thickness above the body
FT_BODY_HEIGHT = 4.5            # total body height (flange + glass-bead body)
FT_PIN_PCD = 7.5                # pin circle diameter (typical 12-pin layout)
FT_PIN_COUNT = 12
FT_PIN_DIAMETER = 0.46          # Kovar pin OD
FT_PIN_CLEARANCE = 0.20         # 0.10 mm per side → standard 0.7 mm drill bit
FT_PIN_LENGTH_OUT = 6.0         # protrusion below cap (external, for PCB solder)
FT_PIN_LENGTH_IN = 8.0          # protrusion above cap (internal, to electrodes)
FT_SEAL = "Torr Seal"          # UHV vacuum epoxy around body perimeter + pin annuli

# --- Cathode stack (laser-cut 0.2 mm nickel foil, digits 0-9) ---
CATH_FOIL_THICKNESS = 0.2
CATH_DIGIT_HEIGHT = 15.0        # visible digit height (mm)
CATH_DIGIT_WIDTH = 9.0          # actual 7-seg H-bar span (SEG_H_LENGTH = 9.0)
CATH_PITCH = 1.5                # axial spacing between digit planes
CATH_COUNT = 10

# --- Anode mesh (front plate, nickel wire) ---
# The anode is chord-clipped to envelope ID at its Y offset, not a full disk.
# Actual width = 2*sqrt(R²-y²)*0.9 ≈ 13.1 mm at y_offset = -8.25.
ANODE_OD = 13.1                 # effective chord-clipped width (not circular OD)
ANODE_WIRE_D = 0.3
ANODE_CELL = 2.0                # mesh opening pitch

# --- Composite seal architecture (butyl inner + Torr Seal outer) ---
# Problem: Al CTE=23.6 vs borosilicate CTE=3.3 → 7× mismatch.
#   - Rigid Torr Seal alone → fatigue-cracks at the interface under cycling.
#   - Silicone RTV alone → too gas-permeable (~3e-6, 200× WORSE than butyl).
#   - Butyl alone with 2mm path → tube poisons in <2 hrs.
# Solution: composite layered seal:
#   INNER: IIR butyl rubber fills the full lip-to-glass annulus (4 mm path).
#     Butyl is flexible (absorbs CTE strain) AND low-permeability (~1.4e-8).
#   OUTER: Torr Seal overcoat on the exposed external joint face (~3 mm path).
#     Rigid epoxy provides near-zero permeability. Protected from CTE cycling
#     because the butyl cushion absorbs all differential strain internally.
# Effective: butyl 4mm + Torr Seal 3mm = 7mm total path; rate-limited by
# Torr Seal layer (~1e-15 perm) → tube lifetime measured in years.
INNER_SEAL = "IIR butyl rubber"  # flexible + low-perm, fills annulus
INNER_SEAL_PATH_MM = END_CAP_LIP_HEIGHT  # 4.0 mm (full lip contact)
OUTER_SEAL = "Torr Seal"        # rigid gas barrier, external overcoat
OUTER_SEAL_PATH_MM = 3.0        # applied on exposed joint face
METAL_SEAL = "Torr Seal"        # rigid UHV epoxy for Kovar/Cu-to-Al

# --- Fill gas ---
# Penning mixture (Ne + 0.5% Ar) reduces strike voltage from >250V (pure Ne)
# to ~170V, compatible with standard K155ID1/74141 Nixie driver ICs.
FILL_GAS = "Ne + 0.5% Ar"
FILL_PRESSURE_TORR = 15.0

# Sol-gel SiO₂ overcoat REMOVED — was non-structural cosmetic-only layer.
# The composite seal (butyl inner + Torr Seal outer) provides all necessary
# hermeticity. Removing sol-gel eliminates one process step (dip-coat +
# thermal anneal) and one consumable, reducing total seal materials to 2.

# --- Assembly clearances ---
INTERNAL_CLEARANCE = 0.5        # min clearance between any two parts
