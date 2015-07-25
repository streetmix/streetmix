;(function () {
  /**
   *  Width chart functionality is deprecated
   *  It did not exist in the post August-2013 version of Streetmix
   *  and so its styling, code, etc were out of place.
   *  The code remains here and encapsulated in its own closure
   *  with no export / return so it cannot leak into global scope
   *  in case anyone wants to resurrect it from the dead.
   *  The images that are referred to here have been deleted
   *  and the DOM / styles for this feature have also been removed.
   */
  var WIDTH_CHART_WIDTH = 500
  var WIDTH_CHART_EMPTY_OWNER_WIDTH = 40
  var WIDTH_CHART_MARGIN = 20

  var widthChartShowTimerId = -1
  var widthChartHideTimerId = -1

  var SEGMENT_OWNERS = {
    'car': {
      owner: SEGMENT_OWNER_CAR,
      imageUrl: '/images/ui/icons/noun_project_72.svg',
      imageSize: .8
    },
    'public-transit': {
      owner: SEGMENT_OWNER_PUBLIC_TRANSIT,
      imageUrl: '/images/ui/icons/noun_project_97.svg',
      imageSize: .8
    },
    'bike': {
      owner: SEGMENT_OWNER_BIKE,
      imageUrl: '/images/ui/icons/noun_project_536.svg',
      imageSize: 1.1
    },
    'pedestrian': {
      owner: SEGMENT_OWNER_PEDESTRIAN,
      imageUrl: '/images/ui/icons/noun_project_2.svg',
      imageSize: .8
    },
    'nature': {
      owner: SEGMENT_OWNER_NATURE,
      imageUrl: '/images/ui/icons/noun_project_13130.svg',
      imageSize: .8
    }
  }

  function _recalculateOwnerWidths () {
    var ownerWidths = {}

    for (var id in SEGMENT_OWNERS) {
      ownerWidths[id] = 0
    }

    for (var i in street.segments) {
      var segment = street.segments[i]

      ownerWidths[SEGMENT_INFO[segment.type].owner] += segment.width
    }

    _updateWidthChart(ownerWidths)
  }

  function _updateWidthChart (ownerWidths) {
    return

    var ctx = document.querySelector('#width-chart').getContext('2d')

    var chartWidth = WIDTH_CHART_WIDTH
    var canvasWidth = document.querySelector('#width-chart').offsetWidth
    var canvasHeight = document.querySelector('#width-chart').offsetHeight

    document.querySelector('#width-chart').width = canvasWidth * system.hiDpi
    document.querySelector('#width-chart').height = canvasHeight * system.hiDpi

    chartWidth -= WIDTH_CHART_MARGIN * 2

    var left = (canvasWidth - chartWidth) / 2

    for (var id in SEGMENT_OWNERS) {
      if (ownerWidths[id] == 0) {
        chartWidth -= WIDTH_CHART_EMPTY_OWNER_WIDTH
      }
    }

    var maxWidth = street.width
    if (street.occupiedWidth > street.width) {
      maxWidth = street.occupiedWidth
    }

    var multiplier = chartWidth / maxWidth

    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1

    var bottom = 70

    _drawLine(ctx, left, 20, left, bottom)
    if (maxWidth > street.width) {
      _drawLine(ctx, left + street.width * multiplier, 20,
        left + street.width * multiplier, 40)

      ctx.save()
      // TODO const
      ctx.strokeStyle = 'red'
      ctx.fillStyle = 'red'
      _drawArrowLine(ctx,
        left + street.width * multiplier, 30,
        left + maxWidth * multiplier, 30,
        _prettifyWidth(-street.remainingWidth, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP))
      ctx.restore()
    }

    _drawLine(ctx, left + maxWidth * multiplier, 20,
      left + maxWidth * multiplier, bottom)
    _drawArrowLine(ctx,
      left, 30, left + street.width * multiplier, 30,
      _prettifyWidth(street.width, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP))

    var x = left

    for (var id in SEGMENT_OWNERS) {
      if (ownerWidths[id] > 0) {
        var width = ownerWidths[id] * multiplier

        _drawArrowLine(ctx, x, 60, x + width, 60,
          _prettifyWidth(ownerWidths[id], PRETTIFY_WIDTH_OUTPUT_NO_MARKUP))
        _drawLine(ctx, x + width, 50, x + width, 70)

        var imageWidth = images[SEGMENT_OWNERS[id].imageUrl].width / 5 * SEGMENT_OWNERS[id].imageSize
        var imageHeight = images[SEGMENT_OWNERS[id].imageUrl].height / 5 * SEGMENT_OWNERS[id].imageSize

        ctx.drawImage(images[SEGMENT_OWNERS[id].imageUrl],
          0,
          0,
          images[SEGMENT_OWNERS[id].imageUrl].width,
          images[SEGMENT_OWNERS[id].imageUrl].height,
          (x + width / 2 - imageWidth / 2) * system.hiDpi,
          (80 - imageHeight) * system.hiDpi,
          imageWidth * system.hiDpi,
          imageHeight * system.hiDpi)

        x += width
      }
    }

    if (street.remainingWidth > 0) {
      ctx.save()
      // TODO const
      ctx.strokeStyle = 'rgb(100, 100, 100)'
      ctx.fillStyle = 'rgb(100, 100, 100)'
      if (ctx.setLineDash) {
        ctx.setLineDash([15, 10])
      }
      _drawArrowLine(ctx, x, 60, left + street.width * multiplier, 60, _prettifyWidth(street.remainingWidth, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP))
      ctx.restore()
    }

    x = left + maxWidth * multiplier

    for (var id in SEGMENT_OWNERS) {
      if (ownerWidths[id] == 0) {
        var width = WIDTH_CHART_EMPTY_OWNER_WIDTH

        ctx.fillStyle = 'rgb(100, 100, 100)'
        ctx.strokeStyle = 'rgb(100, 100, 100)'

        _drawArrowLine(ctx, x, 60, x + width, 60, '–')
        _drawLine(ctx, x + width, 50, x + width, 70)

        var imageWidth = images[SEGMENT_OWNERS[id].imageUrl].width / 5 * SEGMENT_OWNERS[id].imageSize
        var imageHeight = images[SEGMENT_OWNERS[id].imageUrl].height / 5 * SEGMENT_OWNERS[id].imageSize

        ctx.save()
        ctx.globalAlpha = .5
        ctx.drawImage(images[SEGMENT_OWNERS[id].imageUrl],
          0,
          0,
          images[SEGMENT_OWNERS[id].imageUrl].width,
          images[SEGMENT_OWNERS[id].imageUrl].height,
          (x + width / 2 - imageWidth / 2) * system.hiDpi,
          (80 - imageHeight) * system.hiDpi,
          imageWidth * system.hiDpi,
          imageHeight * system.hiDpi)
        ctx.restore()

        x += width
      }
    }
  }

  function _showWidthChartImmediately () {
    return

    document.querySelector('.width-chart-canvas').classList.add('visible')
  }

  function _showWidthChart () {
    window.clearTimeout(widthChartHideTimerId)
    window.clearTimeout(widthChartShowTimerId)

    // TODO const
    widthChartShowTimerId = window.setTimeout(_showWidthChartImmediately, 750)
  }

  function _hideWidthChartImmediately () {
    document.querySelector('.width-chart-canvas').classList.remove('visible')
  }

  function _hideWidthChart () {
    window.clearTimeout(widthChartHideTimerId)
    window.clearTimeout(widthChartShowTimerId)

    // TODO const
    widthChartHideTimerId = window.setTimeout(_hideWidthChartImmediately, 2000)
  }

}())
