goog.provide('og.Ellipsoid');

goog.require('og.math');
goog.require('og.math.Vector3');
goog.require('og.LonLat');

/**
 * Class represents a plant ellipsoid.
 * @class
 * @param {number} equatorialSize - Equatorial ellipsoid size.
 * @param {number} polarSize - Polar ellipsoid size.
 */
og.Ellipsoid = function (equatorialSize, polarSize) {
    this._a = equatorialSize;
    this._b = polarSize;
    //this._flattening = equatorialSize / polarSize;

    this._a2 = equatorialSize * equatorialSize;
    this._b2 = polarSize * polarSize;

    var qa2b2 = Math.sqrt(this._a2 - this._b2);

    this._e = qa2b2 / equatorialSize;
    this._e2 = this._e * this._e;
    this._e22 = this._e2 * this._e2;

    this._k = qa2b2 / polarSize;
    this._k2 = this._k * this._k;

    this._radii = new og.math.Vector3(equatorialSize, polarSize, equatorialSize);
    this._radii2 = new og.math.Vector3(this._a2, this._b2, this._a2);
    this._invRadii = new og.math.Vector3(1 / equatorialSize, 1 / polarSize, 1 / equatorialSize);
    this._invRadii2 = new og.math.Vector3(1 / this._a2, 1 / this._b2, 1 / this._a2);
};

/**
 * Gets ellipsoid equatorial size.
 * @public
 * @retuens {number}
 */
og.Ellipsoid.prototype.getEquatorialSize = function () {
    return this._a;
};

/**
 * Gets ellipsoid polar size.
 * @public
 * @retuens {number}
 */
og.Ellipsoid.prototype.getPolarSize = function () {
    return this._b;
};

/**
 * Gets cartesian ECEF from Wgs84 geodetic coordiantes.
 * @public
 * @param {og.LonLat} lonlat - Degrees geodetic coordiantes.
 * @returns {og.math.Vector3}
 */
og.Ellipsoid.prototype.lonLatToCartesian = function (lonlat) {
    var latrad = og.math.RADIANS * lonlat.lat,
        lonrad = og.math.RADIANS * lonlat.lon;

    var slt = Math.sin(latrad);

    var N = this._a / Math.sqrt(1 - this._e2 * slt * slt);
    var nc = (N + lonlat.height) * Math.cos(latrad);

    return new og.math.Vector3(
        nc * Math.sin(lonrad),
        (N * (1 - this._e2) + lonlat.height) * slt,
        nc * Math.cos(lonrad));
};

/**
 * Gets Wgs84 geodetic coordiantes from cartesian ECEF.
 * @public
 * @param {og.math.Vector3} cartesian - Cartesian coordinates.
 * @returns {og.LonLat}
 */
og.Ellipsoid.prototype.cartesianToLonLat = function (cartesian) {
    var x = cartesian.z, y = cartesian.x, z = cartesian.y;
    var ecc2 = this._e2;
    var ecc22 = this._e22;
    var r2 = x * x + y * y;
    var r = Math.sqrt(r2);
    var e2 = this._a2 - this._b2;
    var z2 = z * z;
    var f = 54.0 * this._b2 * z2;
    var g = r2 + (1 - ecc2) * z2 + ecc2 * e2;
    var g2 = g * g;
    var c = ecc22 * f * r2 / (g2 * g);
    var s = Math.pow((1 + c + Math.sqrt(c * (c + 2))), 0.33333333333333333);
    var p = f / (3 * Math.pow((1 + s + 1 / s), 2) * g2);
    var q = Math.sqrt(1 + 2 * ecc22 * p);
    var r0 = -(p * ecc2 * r) / 1 + q + Math.sqrt(0.5 * this._a2 * (1 + 1 / q) - p * (1 - ecc2) * z2 / (q * (1 + q)) - 0.5 * p * r2);
    var recc2r0 = r - ecc2 * r0;
    var recc2r02 = recc2r0 * recc2r0;
    var u = Math.sqrt(recc2r02 + z2);
    var v = Math.sqrt(recc2r02 + (1 - ecc2) * z2);
    var z0 = this._b2 * z / (this._a * v);
    var h = u * (1 - this._b2 / (this._a * v));
    var phi = Math.atan((z + this._k2 * z0) / r);
    var lambda = Math.atan2(y, x);
    var lat = phi * og.math.DEGREES;
    var lon = lambda * og.math.DEGREES;
    return new og.LonLat(lon, lat, h);
};

/**
 * Gets ellipsoid surface normal.
 * @public
 * @param {og.math.Vector3} coord - Spatial coordiantes.
 * @returns {og.math.Vector3}
 */
og.Ellipsoid.prototype.getSurfaceNormal3v = function (coord) {
    var r2 = this._invRadii2;
    var nx = coord.x * r2.x, ny = coord.y * r2.y, nz = coord.z * r2.z;
    var l = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz);
    return new og.math.Vector3(nx * l, ny * l, nz * l);
};

/**
 * Gets the cartesian point on the height over the ellipsoid surface.
 * @public
 * @param {og.math.Vector3} coord - Spatial ellipsoid coordiantes.
 * @param {number} h - Height this spatial coordinates.
 * @return {og.math.Vector3}
 */
og.Ellipsoid.prototype.getSurfaceHeight3v = function (coord, h) {
    var r2 = this._invRadii2;
    var nx = coord.x * r2.x, ny = coord.y * r2.y, nz = coord.z * r2.z;
    var l = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz);
    return new og.math.Vector3(coord.x + h * nx * l, coord.y + h * ny * l, coord.z + h * nz * l);
};

/**
 * Returns the distance from one point to another(using haversine formula).
 * @param   {og.LonLat} lonLat1 - Longitude/latitude of source point.
 * @param   {og.LonLat} lonLat2 - Longitude/latitude of destination point.
 * @return {number} Distance between points.
 */
og.Ellipsoid.prototype.getGreatCircleDistance = function (lonLat1, lonLat2) {
    var dLat = (lonLat2.lat - lonLat1.lat) * og.math.RADIANS;
    var dLon = (lonLat2.lon - lonLat1.lon) * og.math.RADIANS;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lonLat1.lat * og.math.RADIANS) * Math.cos(lonLat2.lat * og.math.RADIANS);
    return this._a * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Returns the midpoint between two points.
 * @param   {og.LonLat} lonLat1 - Longitude/latitude of first point.
 * @param   {og.LonLat} lonLat2 - Longitude/latitude of second point.
 * @return {og.LonLat} Midpoint between points.
 */
og.Ellipsoid.prototype.getMiddlePointOnGreatCircle = function (lonLat1, lonLat2) {
    var f1 = lonLat1.lat * og.math.RADIANS,
        l1 = lonLat1.lon * og.math.RADIANS;
    var f2 = lonLat2.lat * og.math.RADIANS;
    var dl = (lonLat2.lon - lonLat1.lon) * og.math.RADIANS;

    var Bx = Math.cos(f2) * Math.cos(dl);
    var By = Math.cos(f2) * Math.sin(dl);

    var x = Math.sqrt((Math.cos(f1) + Bx) * (Math.cos(f1) + Bx) + By * By);
    var y = Math.sin(f1) + Math.sin(f2);
    var f3 = Math.atan2(y, x);

    var l3 = l1 + Math.atan2(By, Math.cos(f1) + Bx);

    return new og.LonLat((l3 * og.math.DEGREES + 540) % 360 - 180, f3 * og.math.DEGREES);
};

/**
 * Returns the point at given fraction between two points.
 * @param   {og.LonLat} lonLat1 - Longitude/Latitude of source point.
 * @param   {og.LonLat} lonLat2 - Longitude/Latitude of destination point.
 * @param   {number} fraction - Fraction between the two points (0 = source point, 1 = destination point).
 * @returns {og.LonLat} Intermediate point between points.
 */
og.Ellipsoid.prototype.getIntermediatePointOnGreatCircle = function (lonLat1, lonLat2, fraction) {
    var f1 = lonLat1.lat * og.math.RADIANS, l1 = lonLat1.lon * og.math.RADIANS;
    var f2 = lonLat2.lat * og.math.RADIANS, l2 = lonLat2.lon * og.math.RADIANS;

    var sinf1 = Math.sin(f1), cosf1 = Math.cos(f1), sinl1 = Math.sin(l1), cosl1 = Math.cos(l1);
    var sinf2 = Math.sin(f2), cosf2 = Math.cos(f2), sinl2 = Math.sin(l2), cosl2 = Math.cos(l2);

    var df = f2 - f1,
        dl = l2 - l1;
    var a = Math.sin(df / 2) * Math.sin(df / 2) + Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) * Math.sin(dl / 2);
    var d = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    var A = Math.sin((1 - fraction) * d) / Math.sin(d);
    var B = Math.sin(fraction * d) / Math.sin(d);

    var x = A * cosf1 * cosl1 + B * cosf2 * cosl2;
    var y = A * cosf1 * sinl1 + B * cosf2 * sinl2;
    var z = A * sinf1 + B * sinf2;

    var f3 = Math.atan2(z, Math.sqrt(x * x + y * y));
    var l3 = Math.atan2(y, x);

    return new og.LonLat((l3 * og.math.DEGREES + 540) % 360 - 180, f3 * og.math.DEGREES);
};