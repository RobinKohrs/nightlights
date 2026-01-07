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
r_202110 <- bm_raster(
  roi_sf = roi_sf,
  product_id = "VNP46A3",
  date = "2025-12-01",
  bearer = bearer)
