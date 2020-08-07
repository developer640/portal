<template>
  <div>
    <Row>
      <Col v-for="item in this.appList" :key="item.key" span="4">
        <div>
          <Card style="width:250px">
            <div  @click="handleToWebsite(item.code)" style="text-align:center;cursor:pointer;">
              <Avatar size="70" style="background-color: #ed4014;margin-bottom: 20px;">{{ item.code.substring(0,1).toUpperCase() }}</Avatar>
                <h3>{{ item.name }}</h3>
            </div>
          </Card>
        </div>
      </Col>
    </Row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getApplicationUrl } from '@/api/application'
export default {
  name: 'home',
  data () {
    return {
      appList: []
    }
  },
  methods: {
    ...mapGetters([
      'applications'
    ]),
    handleToWebsite (code) {
      const condition = {
        code
      }

      getApplicationUrl(condition).then(res => {
        if (res.data.code === '000000') {
          console.log(res.data.data)
          window.open(res.data.data)
        }
      }).catch(() => {

      })
    }
  },
  created () {
    this.appList = this.applications()
  },
  mounted () {

  }
}
</script>
