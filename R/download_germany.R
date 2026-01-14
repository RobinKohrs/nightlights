library(tidyverse)
library(here)
library(glue)
library(sf)
library(davR)
library(jsonlite)
library(geodata)
library(blackmarbler)

# ++++++++++++++++++++++++++++++
# bearer ----
# ++++++++++++++++++++++++++++++
bearer <- readLines("~/.ssh/earthdata")


# ++++++++++++++++++++++++++++++
# roi ----
# ++++++++++++++++++++++++++++++
roi_sf <- gadm(country = "DEU", level = 1, path = tempdir())


### Monthly data: raster for Dec 25
res <- bm_raster(
  roi_sf = roi_sf,
  product_id = "VNP46A3",
  date = "2025-11-01",
  bearer = bearer)

# ++++++++++++++++++++++++++++++
# write out ----
# ++++++++++++++++++++++++++++++
path_out  <- sys_make_path(here("data/geodata/nov_25_germany.tif"))
writeRaster(res, path_out)
