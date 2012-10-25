/*
  Author: Arjun Variar
  Date: 23rd Oct 2012
  kMeans Clustering algorithm implemented from javascript as per the logic from Andrew Ng's ML class.
  Implementation is for node.js, should work on the browser too.
  Dependencies:
    Javascript Sylvester library is used for matrix operations.
  Notes:
    Added feature scaling to the algorithm as an optional thing to do, somehow it doesnt fit well this data.
*/


var syl = require('sylvester')

function kMeans(A,K,I,F){
  this.mat = A;
  this.K   = K;
  this.MAX_ITER = I;
  this.syl_mat = $M(A);
  this.dims = this.syl_mat.dimensions()
  if (F) this.featureScale();
  return this.init();
}

kMeans.prototype.featureScale = function() {
  var n = this.dims.cols,m = this.dims.rows
  var u = syl.Matrix.Zero(n,2)
  var syl_mat_F = syl.Matrix.Zero(m,n)
  var syl_mat = this.syl_mat
  var std = {}
  for (var i = 1;i<=n;++i) {
    std = this.stdDeviation(syl_mat.col(i).elements)
    for (var j = 1;j<=m;++j) {
      syl_mat_F.elements[j-1][i-1] = (syl_mat.elements[j-1][i-1] - std.m) / std.d
    }
  }
  console.log(syl_mat_F);
  this.syl_mat = syl_mat_F
}

kMeans.prototype.stdDeviation = function(a) {
  var r = {m: 0, d: 0}, t = a.length;
  for(var m, s = 0, l = t; l--; s += a[l]);
  for(m = r.m = s / t, l = t, s = 0; l--; s += Math.pow(a[l] - m, 2));
  return r.d = Math.sqrt(s/t), r;
}

kMeans.prototype.kinitCentroid = function(p) {
  var arr = this.mat.slice(0)
  for (var i = arr.length-1;i >= 0;i--) {
    var r = Math.floor(Math.random()*i)
    var t = arr[i]
    arr[i] = arr[r]
    arr[r] = t
  }
  return $M(arr.slice(0,p))
}

kMeans.prototype.init = function() {
  var K = this.K
  var idx,centroids,min = Infinity
  for (var i=0;i<10;++i) {
    centroids = this.kinitCentroid(K)
    for (var i = 0;i<this.MAX_ITER;++i) {
      result = this.kfindClosestCentroids(centroids)
      idx = result[0]
      _m = result[1]
      centroids = this.kComputeCentroid(idx)
    }
    if (_m < min) {
      r_idx = idx
      _m = min
    }
  }
  return r_idx;
}

kMeans.prototype.kComputeCentroid = function(idx) {
  var X = this.syl_mat
  var K = this.K
  var m = this.dims.rows,n = this.dims.cols
  var centroid = syl.Matrix.Zero(K,n)
  var cenrtoidCount = syl.Vector.Zero(K)
  for (var i = 1;i <= m;i++) {
    for (var k = 1;k <= K;k++) {
      if (idx.e(i) == k) {
        centroid.elements[k-1] = centroid.row(k).add(X.row(i))
        cenrtoidCount.elements[k-1] = cenrtoidCount.e(k) + 1
      }
    }
  }
  for ( var k = 1;k<=K;++k) {
    centroid.elements[k-1] = centroid.row(k).multiply(Math.pow(cenrtoidCount.e(k),-1))
  }
  return centroid
}

kMeans.prototype.kfindClosestCentroids = function(centroids) {
  var X = this.syl_mat
  var K = this.K
  var m = this.dims.rows,n = this.dims.cols
  var idx = syl.Vector.Zero(m)
  for (var i = 1;i<=m;++i) {
    _m = Infinity
    for (var k =1;k<=K;++k) {
       var d = X.row(i).transpose().subtract(centroids.row(k).transpose())
       var d2 = d.transpose().multiply(d).det()
       if (d2 < _m) {
          idx.elements[i-1] = k;
          _m = d2
       }
    }
  }
  return [idx,_m];
}

module.exports = kMeans