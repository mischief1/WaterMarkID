package cn.simpletool.watermarker.controller;

import cn.simpletool.watermarker.model.WaterConfig;
import cn.simpletool.watermarker.service.WaterConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 水印默认配置信息的接口
 *
 * @author ZhanJingbo
 * @version 1.0.0
 * Created on 2017/12/17
 */
@RestController
@RequestMapping("/api")
public class WaterConfigController {

    @Autowired
    private WaterConfigService waterConfigService;

    @RequestMapping("/waterConfig/{platformType}")
    public WaterConfig getWaterConfigByPlatformType(@PathVariable("platformType") int platformType) {
        return waterConfigService.getWaterConfig(platformType);
    }
}
