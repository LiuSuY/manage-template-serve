import Mock from 'mockjs'
import setupMock, { successResponseWrap } from '@/utils/setup-mock'
import { Random } from 'mockjs'

type eyeconfigRecord = {
  id: string
  name: string
  type: string
  area: string
}

// 生成模拟数据
const generateData = (count: number) => {
  const result: eyeconfigRecord[] = []
  for (let i = 0; i < count; i++) {
    result.push({
      id: Random.id(),
      name: Random.cword(3, 5),
      type: Random.pick(['type1', 'type2']),
      area: Random.county(true),
    })
  }
  return result
}

setupMock({
  setup() {
    // 获取eyeconfig列表
    Mock.mock(new RegExp('/api/eyeconfig/list'), (params) => {
      const { url } = params
      const queryParams = new URLSearchParams(url.split('?')[1])
      const current = Number(queryParams.get('current')) || 1
      const pageSize = Number(queryParams.get('pageSize')) || 10
      const name = queryParams.get('name') || ''
      const type = queryParams.get('type') || ''
      const area = queryParams.get('area') || ''

      // 生成100条数据
      const allData = generateData(100)

      // 根据查询条件筛选数据
      let filteredData = [...allData]
      if (name) {
        filteredData = filteredData.filter((item) => item.name.includes(name))
      }
      if (type) {
        filteredData = filteredData.filter((item) => item.type === type)
      }
      if (area) {
        filteredData = filteredData.filter((item) => item.area.includes(area))
      }

      // 分页处理
      const total = filteredData.length
      const list = filteredData.slice((current - 1) * pageSize, current * pageSize)

      return successResponseWrap({
        list,
        total,
      })
    })

    // 删除eyeconfig
    Mock.mock(new RegExp('/api/eyeconfig/delete'), 'post', (params) => {
      const { body } = params
      const { id } = JSON.parse(body)
      // 实际应用中会删除数据，这里只返回成功响应
      return successResponseWrap(null)
    })
  },
})
