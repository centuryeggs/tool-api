const express = require('express')
const cors = require('cors')
const request = require('request')
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const router = express.Router()
router.get('/isWorkDay', async(req, res) => {
  let date = ''
  if (req.query && req.query.date) {
    date = req.query.date
  } else {
    date = getDate()
  }
  let resObj = {}
  let holidayList = await getHolidayList(date.split('-')[0])
  let holiday = holidayList.days.find(i => i.date === date)
  if (holiday) {
    resObj.isWorkDay = !holiday.isOffDay
    resObj.description = holiday.name + (holiday.isOffDay ? '放假' : '调休上班')
    resObj.from = holidayList.papers
  } else {
    resObj.isWorkDay = !isWeekend(date)
    resObj.description = isWeekend(date) ?  '普通周末' : '普通工作日'
  }
  res.send(resObj)
})

app.use('/', router)
const server = app.listen(5000, function () {
  const { address, port } = server.address()
  console.log('HTTP启动成功：http://localhost:' + port + '/isWorkDay')
})
function getDate() {
  const date = new Date()
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  month = month > 9 ? month : '0' + month
  day = day > 9 ? day : '0' + day
  return `${year}-${month}-${day}`
}

function getHolidayList(year) {
  return new Promise((resolve, reject) => {
    request.get({
        url: `https://natescarlet.coding.net/p/github/d/holiday-cn/git/raw/master/${year}.json`,
      }, (error, response, body) => {
        if (error) {
          reject(error)
        } else {
          resolve(JSON.parse(response.body))
        }
      }
    )
  })
}

function isWeekend (str) {
  let year = Number(str.split('-')[0])
  let month = Number(str.split('-')[1]) - 1
  let day = Number(str.split('-')[2])
  let num = new Date(year, month, day).getDay()
  return num === 6 || num === 0
}