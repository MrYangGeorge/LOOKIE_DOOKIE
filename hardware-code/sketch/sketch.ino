#include <Arduino_RouterBridge.h>
#include <Arduino_Modulino.h>

const int led = 7;
const int sensor_pin = A0;
int sensor;
const int threshold = 100;
ModulinoThermo thermo;

void setup() {
  Bridge.begin();
  Modulino.begin(Wire1);
  Bridge.provide("light", get_light_state);
  Bridge.provide("temperature", get_temperature);
  pinMode(led,OUTPUT);
  thermo.begin();
}

void loop() {
  Bridge.update();
  sensor = analogRead(sensor_pin);
  if(sensor<threshold)
    digitalWrite(led,HIGH);
  else{
    digitalWrite(led,LOW);
  }
  delay(500);
}

int get_light_state() {
    sensor = analogRead(sensor_pin);
    return sensor;
}

float get_temperature()  {
    float temp_c = thermo.getTemperature();
    return temp_c*1.8 + 32;
}


